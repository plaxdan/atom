/**
 * ScannerPlugin.cpp - Implementation of CScannerPlugin class
 * @author Matt Kunze
 *
 * Copyright (c) 2001, DataSplice, LLC. All rights reserved.
 */

#include "stdafx.h"

// barcode scanner implementations
#ifdef _WIN32_WCE

#include "SymbolScanner.h"
#include "LxeScanner.h"
#include "PsionTeklogixScanner.h"
#include "OpticonScanner.h"
#include "HoneywellScanner.h"


#else

#include "SymbolSnapiScanner.h"
#include "MotorolaDesktopScanner.h"
#include "IntelMCAScanner.h"
#include "PanasonicBCRPowerControlScanner.h"
#include "DTResearchScanner.h"
#include "IntermecScanEngineScanner.h"
#include "WedgeSpyScanner.h"
#include "KoamTacScanner.h"
#endif

#include "IntermecScanner.h"
#include "ComPortScanner.h"
#include "SimulateScanner.h"


// DSCore includes
#include "attributes/AttributeBuilder.h"
#include "client/ClientOptionsManager.h"
#include "client/ClientViewManager.h"
#include "client/RemoteClientEngine.h"
#include "event/EventFactory.h"
#include "parser/ParseTreeEvaluator.h"

// DSGui includes
#include "dialog/ErrorDialog.h"
#include "dialog/PopupGridDialog.h"
#include "editor/FilterEditor.h"
#include "grid/ResultsetGrid.h"
#include "util/EntryForm.h"
#include "view_display/ViewDisplay.h"
#include "view_display/ViewSearchPane.h"

#define WM_ON_SCAN	WM_USER + 123

#define OPTION_KEY	_T("ScannerPlugin")

#define SCANNER_DRIVER_OPTION	_T("ScannerDriver")
#define LOADED_SCANNER_OPTION	_T("LoadedScanner")
#define AUTO_DETECT_SCANNER	_T("Auto Detect")

#ifdef _DEBUG
#define new DEBUG_NEW
#undef THIS_FILE
static char THIS_FILE[] = __FILE__;
#endif

static AFX_EXTENSION_MODULE ScannerPluginDLL = { NULL, NULL };

extern "C" int APIENTRY
DllMain(HANDLE hInstance, DWORD dwReason, LPVOID lpReserved)
{
	// Remove this if you use lpReserved
	UNREFERENCED_PARAMETER(lpReserved);

	if (dwReason == DLL_PROCESS_ATTACH)
	{
		TRACE0("SCANNERSPLUGIN.DLL Initializing!\n");

		// Extension DLL one-time initialization
		if (!AfxInitExtensionModule(ScannerPluginDLL, (HINSTANCE)hInstance))
			return 0;

		// Insert this DLL into the resource chain
		// NOTE: If this Extension DLL is being implicitly linked to by
		//  an MFC Regular DLL (such as an ActiveX Control)
		//  instead of an MFC application, then you will want to
		//  remove this line from DllMain and put it in a separate
		//  function exported from this Extension DLL.  The Regular DLL
		//  that uses this Extension DLL should then explicitly call that
		//  function to initialize this Extension DLL.  Otherwise,
		//  the CDynLinkLibrary object will not be attached to the
		//  Regular DLL's resource chain, and serious problems will
		//  result.

		new CDynLinkLibrary(ScannerPluginDLL);
	}
	else if (dwReason == DLL_PROCESS_DETACH)
	{
		TRACE0("TIMINGSTATSPLUGIN.DLL Terminating!\n");
		// Terminate the library before destructors are called
		AfxTermExtensionModule(ScannerPluginDLL);
	}
	return 1;   // ok
}


// The one and only CScannerPlugin object
CScannerPlugin plugin;

// exported function so plugin managers can load us
//extern "C" IDSPlugin* __declspec(dllexport) GetDSPlugin()
extern "C" __declspec(dllexport) IDSPlugin* GetDSPlugin()
{
	return &plugin;
}


/////////////////////////////////////////////////////////////////////////////
// CScannerPlugin construction and initialization

CScannerPlugin::CScannerPlugin()
{
	m_pEngine = NULL;
	m_pCurrentScanner = NULL;
	m_inFireEvents = FALSE;
}

CScannerPlugin::~CScannerPlugin()
{
	// this was probably already called
	CError error;
	Stop(error);

	for(int index = 0; index < m_drivers.GetSize(); index++)
		delete m_drivers[index];
}

// end CScannerPlugin construction and initialization
/////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////
// CScannerPlugin public functions

void CScannerPlugin::OnScan(
			CString data , HWND notifyWnd /* = NULL */)
{
	// this probably is being called by a worker thread, so post a message
	// and handle it in the main thread
	CString* pData = new CString(data);
	if ( notifyWnd )
	{
		::PostMessage( notifyWnd , WM_ON_SCAN , (WPARAM) pData , NULL );
	}
	else
	{
		AfxGetMainWnd()->PostMessage(WM_ON_SCAN, (WPARAM)pData);
	}
}

CString CScannerPlugin::GetScannerDriver()
{
	CString retVal = AUTO_DETECT_SCANNER;

	// default - default is Auto Detect and if not explicitly set by user or attribute it is set back into the options
	// as Auto Detect
	CVariant value;
	if(m_options.GetOptionValue(SCANNER_DRIVER_OPTION, value)) retVal = (CString)value;

	// allow DS_SCANNER_DRIVER to overwrite AutoDetect
	if ( retVal == AUTO_DETECT_SCANNER )
	{
		CString attribVal = GetDriverAttribute();
		if ( ! attribVal.IsEmpty() )
		{
			retVal = attribVal;
			value.SetValue( retVal , TRUE );
			// also push this back into the options so scanner does not start/stop everytime someone logs in/out
			m_options.SetOptionValue(SCANNER_DRIVER_OPTION,value);
		}
	}
	TRACE( _T("\r\nGetScannerDriver returning %s\r\n") , retVal );
	return retVal;
}

BOOL CScannerPlugin::IsModuleLoaded( CString module )
{
	module.MakeLower();
	for( int i = 0; i < m_loadedModules.GetCount(); i++ )
	{
		if ( m_loadedModules[i] == module ) return TRUE;
	}
	return FALSE;
}

void CScannerPlugin::SetModuleLoaded( CString module )
{
	module.MakeLower();
	if ( ! IsModuleLoaded( module ) ) m_loadedModules.Add(module);
}


// end CScannerPlugin public functions
/////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////
// CScannerPlugin IDSPlugin overrides

CString CScannerPlugin::GetName() const
{
	return _T("BarcodeScannerPlugin");
}

PLUGIN_FLAGS CScannerPlugin::GetFlags() const
{
	return PF_DEFAULTENABLED;
}

BOOL CScannerPlugin::Initialize(
			IDataSpliceEngine* pEngine,
			CError& error)
{
	if((pEngine->GetType() != DET_BASIC) && (pEngine->GetType() != DET_ADMIN))
		return FALSE;
	m_pEngine = (IRemoteClientEngine*)pEngine;

	// always register the event so you can see it in the admin client even if there is no scanner
	CEventFactory::RegisterEvent(BARCODE_SCAN_EVENT, _L("Bar Code Scan", LOCALIZATION_ADMIN),
			EF_GLOBAL | EF_CLIENT | EF_QUALIFIED);

	// set up the available scanners - these should be added in the order we
	// try to auto-detect the scanners
#ifdef _WIN32_WCE
	m_drivers.Add(new CHoneywellScanner());
	m_drivers.Add(new CSymbolScanner());
	m_drivers.Add(new CPsionTeklogixScanner());
	m_drivers.Add(new CLxeScanner());
	m_drivers.Add(new COpticonScanner());
#else
	// ******* Start of list of Intermec Scan Engine SDK based drivers
	// the drivers that use Intermec Scan Engine SDK (ISDC_RS.DLL) must be loaded in a specific order
	// see CScannerPlugin::IsModuleLoaded header for details
	m_drivers.Add(new CWedgeSpyScanner());  // this needs to go before Intermec Scan Engine (to spy on the wedge using Intermec Scan Engine)
	m_drivers.Add(new CDTResearchScanner());
	m_drivers.Add(new CIntelMCAScanner());

	//this has never worked	- but can use isdc_rs.dll in some configurations  (or uses Motorol for other scanner config)
	// m_drivers.Add(new CPanasonicBCRPowerControlScanner());

	m_drivers.Add(new CIntermecScanEngineScanner());
	// ******* End of list of Intermec Scan Engine SDK based drivers

	m_drivers.Add(new CSymbolSnapiScanner());
	m_drivers.Add(new CMotorolaDesktopScanner());
	m_drivers.Add(new CKoamTacScanner());
#endif
	// support Intermec CV60 and CV61 for desktop build
	m_drivers.Add(new CIntermecScanner());

	// serial support should work in both environments
	m_drivers.Add(new CComPortScanner());

	// make sure this is added last
	m_drivers.Add(new CSimulateScanner());

	// set up the default options
	CConfigurationOption* pOption = new CConfigurationOption(
			SCANNER_DRIVER_OPTION, OT_TEXT, TRUE);
	pOption->GetValuePtr()->SetValue(AUTO_DETECT_SCANNER, TRUE);
	CStringArray names;
	names.Add(AUTO_DETECT_SCANNER);
	for(int index = 0; index < m_drivers.GetSize(); index++)
		names.Add(m_drivers[index]->GetName());
	pOption->SetValueList(names, TRUE);
	m_options.AddOption(pOption);

	// try to use persisted plug-in settings - note that we call SetOptions
	// regardless since this sets up the default options as well
	CClientOptionsManager* pOM = m_pEngine->GetOptionsManager();
	COptionCollection saved;
	pOM->LoadClientOptions(OPTION_KEY, saved, FALSE);
	return SetOptions(saved, error);
}

BOOL CScannerPlugin::GetOptions(
			COptionCollection& options,
			CError& error)
{
	options = m_options;

	// add readonly option to display the current scanner
	CConfigurationOption* pOption = new CConfigurationOption(
			LOADED_SCANNER_OPTION, OT_TEXT, FALSE);
	pOption->SetReadonly(TRUE);
	if(m_pCurrentScanner != NULL)
		pOption->GetValuePtr()->SetValue(m_pCurrentScanner->GetName(), TRUE);
	options.AddOption(pOption);

	return TRUE;
}

BOOL CScannerPlugin::SetOptions(
			COptionCollection& options,
			CError& error)
{
	// set up the default option template
	m_options.Clear();

	// add the driver option
	CConfigurationOption* pOption = new CConfigurationOption(
			SCANNER_DRIVER_OPTION, OT_TEXT, TRUE);
	pOption->GetValuePtr()->SetValue(AUTO_DETECT_SCANNER, TRUE);
	CStringArray names;
	names.Add(AUTO_DETECT_SCANNER);
	for(int index = 0; index < m_drivers.GetSize(); index++)
		names.Add(m_drivers[index]->GetName());
	pOption->SetValueList(names, TRUE);
	m_options.AddOption(pOption);

	if(options.GetCount() > 0)
	{
		// update m_options with any passed in options
		// so they are available to GetScannerDriver() below
		m_options.ApplyOptions(options);
	}

	// Note: GetScannerDriver() can use the previously applied options
	// or it can update the options (if Auto Detect) from DS_SCANNER_DRIVER attribute
	// so we apply options above, then GetScannerDriver and then finally persist them (SaveClientOptions)

	IBarcodeScanner* pScanner = FindScanner(GetScannerDriver(), FALSE);
	if(pScanner != NULL)
	{
		CVariant driver;  // GetScannerDriver() can override Auto Detect with value from DS_SCANNER_DRIVER
		VERIFY(m_options.GetOptionValue(SCANNER_DRIVER_OPTION, driver));
		pScanner->GetDefaultOptions(m_options);
	}

	// persist the options so they'll show up next time
	CClientOptionsManager* pOM = m_pEngine->GetOptionsManager();
	pOM->SaveClientOptions(OPTION_KEY, m_options, FALSE);

	return TRUE;
}

BOOL CScannerPlugin::Start(
			CError& error)
{
	ASSERT(m_pCurrentScanner == NULL);

	CString driver = GetScannerDriver();
	IBarcodeScanner* pTest = FindScanner(driver, TRUE);
	if((pTest == NULL) || !pTest->Start())
	{
		if(pTest != NULL)
			pTest->Stop();
		error.AppendMessage(_L("Failed to load a scanner driver", LOCALIZATION_CORE));
		return FALSE;
	}
	m_pCurrentScanner = pTest;

	m_pEngine->AddFrameListener(this);
	m_pEngine->AddListener(this);

	return TRUE;
}

BOOL CScannerPlugin::Stop(
			CError& error)
{
	if(m_pEngine != NULL)
	{
		m_pEngine->RemoveFrameListener(this);
		m_pEngine->RemoveListener(this);
	}

	if(m_pCurrentScanner != NULL)
	{
		m_pCurrentScanner->Stop();
		m_pCurrentScanner = NULL;
	}

	return TRUE;
}

// end CScannerPlugin IDSPlugin overrides
/////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////
// CScannerPlugin IDefaultActionHandler functions

ACTION_STATUS CScannerPlugin::PerformDefaultAction(
			CEventChainHandler* pHandler,
			const EVENT_IDENTIFIER& eventId)
{
	CWnd* pFocus = CWnd::FromHandle(GetFocus());
	if(pFocus == NULL)
		return AS_CONTINUE;

	CVariant data;
	pHandler->GetContext()->GetAttributes()->GetAttribute(DS_SCANNER_INPUT, data);

	UpdateControl(pFocus, (CString)data);

	return AS_CONTINUE;
}

// end CScannerPlugin IDefaultActionHandler functions
/////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////
// CScannerPlugin IMainFrameListener functions

BOOL CScannerPlugin::OnPreTranslateMessage(
			MSG* pMsg)
{
	if(pMsg->message == WM_ON_SCAN)
	{
		CString* p = (CString*)pMsg->wParam;
		if(!p->IsEmpty())
			m_scanData.Add(*p);
		delete p;
		FireEvents();

		return TRUE;
	}
	else if(m_pCurrentScanner != NULL)
		return m_pCurrentScanner->OnPreTranslateMessage(pMsg);

	return FALSE;
}

// end CScannerPlugin IMainFrameListener functions
/////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////
// CScannerPlugin IRemoteClientListener functions
void CScannerPlugin::OnSessionChanged(IRemoteClientEngine* pEngine)
{
	if ( pEngine && pEngine->GetSession() && ! pEngine->GetSession()->IsEmpty() )
	{
		IBarcodeScanner* pTest = FindScanner(GetScannerDriver(), TRUE);
		if ( pTest )
		{
			if ( m_pCurrentScanner && m_pCurrentScanner == pTest )
			{
				// same scanner, nothing to do
				return;
			}

			if ( m_pCurrentScanner )
			{
				m_pCurrentScanner->Stop();
				m_pCurrentScanner = NULL;
			}

			if(pTest->Start())
			{
				// GetScannerDriver() will have updated the options with new scanner from DS_SCANNER_DRIVER
				// but need to save it here
				CClientOptionsManager* pOM = m_pEngine->GetOptionsManager();
				pOM->SaveClientOptions(OPTION_KEY, m_options, FALSE);

				m_pCurrentScanner = pTest;

			}
		}
	}
}

// end CScannerPlugin IRemoteClientListener functions
/////////////////////////////////////////////////////////////////////////////



/////////////////////////////////////////////////////////////////////////////
// CScannerPlugin internal functions

CString CScannerPlugin::GetDriverAttribute()
{
	CString driver;
	if ( m_pEngine && m_pEngine->GetSession() && ! m_pEngine->GetSession()->IsEmpty() )
	{
		CVariant v;
		CAttributeBuilderPtr attributes = m_pEngine->CreateAttributeBuilder(FALSE);
		if ( attributes->GetAttribute( _T("DS_SCANNER_DRIVER") , v ) && ! v.IsNull() && v.GetType() == VARIANT_STRING )
		{
			driver = (CString)v;
		}
	}
	return driver;
}



IBarcodeScanner* CScannerPlugin::FindScanner(
			CString name,
			BOOL initialize)
{
	if(name.IsEmpty())
		return NULL;

	BOOL autoDetect = (name == AUTO_DETECT_SCANNER);
	for(int index = 0; index < m_drivers.GetSize(); index++)
	{
		IBarcodeScanner* pTest = m_drivers[index];
		if(pTest->GetName() == name)
		{
			if(!initialize || pTest->Initialize(this))
				return pTest;
			else
				return NULL;
		}
		else if(autoDetect && pTest->IsAutoDetectable() && pTest->Initialize(this))
			return pTest;
	}

	return NULL;
}

void CScannerPlugin::UpdateControl(
			CWnd* pControl,
			CString data)
{
	// make sure the entire text of the current text item is selected so any
	// current text will be replaced
	if(pControl->SendMessage(WM_GETDLGCODE) & DLGC_WANTCHARS)
	{
		pControl->SetWindowText(data);

		int length = data.GetLength();
		CEdit* pEdit = DYNAMIC_DOWNCAST(CEdit, pControl);
		if(pEdit != NULL)
		{
			// SetWindowText doesn't seem to send an EN_CHANGE notification, so
			// containers aren't informed that the text changed
			pEdit->GetParent()->SendMessage(WM_COMMAND,
					MAKEWPARAM(pEdit->GetDlgCtrlID(), EN_CHANGE),
					(LPARAM)pEdit->m_hWnd);

			pEdit->SetSel(length, length);
		}
		else
		{
			CComboBox* pCombo = DYNAMIC_DOWNCAST(CComboBox, pControl);
			if(pCombo != NULL)
				pCombo->SetEditSel(length, length);
		}
	}

	CViewDisplay* pVD = (CViewDisplay*)GetControl(RUNTIME_CLASS(CViewDisplay));
	if(pVD != NULL)
	{
		// advance the selection or perform the default action depending on what
		// field is selected
		UINT c = VK_TAB;
		CViewSearchPane* pSearch = DYNAMIC_DOWNCAST(CViewSearchPane, pVD->GetChildPane());
		if(pSearch != NULL)
		{
			CFilterEditor* pEditor = pSearch->GetFilterEditor();

			// by default send a tab character so the next field will be selected
			int selected = pEditor->GetSelectedItem();
			c = VK_TAB;

			// if the last item is selected send a carriage return so the default
			// action is performed
			if(selected == (pEditor->GetItemCount() - 1))
				c = VK_RETURN;
		}

		keybd_event(c, 0, 0, 0);
		keybd_event(c, 0, KEYEVENTF_KEYUP, 0);
	}

	CEntryForm* pForm = (CEntryForm*)GetControl(RUNTIME_CLASS(CEntryForm));
	if(pForm != NULL)
	{
		int selected = pForm->GetSelectedItem();
		if(selected >= 0)
		{
			pForm->VerifyEntry(selected);
			pForm->SetSelectedItem(selected + 1);
		}
	}
}

CWnd* CScannerPlugin::GetControl(
			CRuntimeClass* pRT)
{
	// walk up the window hierarchy from the focused window to try to find
	// a display object
	CWnd* pWnd = CWnd::FromHandle(GetFocus());
	while(pWnd != NULL)
	{
		if(pWnd->GetRuntimeClass()->IsDerivedFrom(pRT))
			return pWnd;

		pWnd = pWnd->GetParent();
	}

	// try the current form window if we get this far
	pWnd = m_pEngine->GetCurrentForm();
	if((pWnd != NULL) && (pWnd->GetRuntimeClass()->IsDerivedFrom(pRT)))
		return pWnd;
	else
		return NULL;
}

void CScannerPlugin::FireEvents()
{
	if(m_inFireEvents)
		return;
	m_inFireEvents = TRUE;

	while(m_scanData.GetSize() > 0)
	{
		CString scanData = m_scanData[0];
		scanData = scanData.Trim( _T(" \t\n\r\a\b\f\v\x1b") );
		m_scanData.RemoveAt(0);
		ASSERT(!scanData.IsEmpty());

		// see if a dialog is being displayed. the only dialog we want the
		// barcode event for is the popup grid dialog since it can probably
		// handle it. everything else we just post the value to the selected
		// control
		BOOL fireEvent = TRUE;
		CWnd* pFocus = CWnd::FromHandle(GetFocus());
		CWnd* pTest = pFocus;
		while(pTest != NULL)
		{
			CDialog* pDialog = DYNAMIC_DOWNCAST(CDialog, pTest);
			if(pDialog != NULL)
			{
				// do nothing if the error dialog is being displayed
				if(pDialog->GetRuntimeClass() == RUNTIME_CLASS(CErrorDialog))
					fireEvent = FALSE;
				else if(pDialog->GetRuntimeClass() != RUNTIME_CLASS(CPopupGridDialog))
				{
					UpdateControl(pFocus, scanData);
					fireEvent = FALSE;
				}

				break;
			}

			pTest = pTest->GetParent();
		}

		if(fireEvent)
		{
			CAttributeBuilderPtr attributes;

			// only inspect the current view pane if we're not on the home screen
			if(DYNAMIC_DOWNCAST(CViewDisplay, m_pEngine->GetCurrentForm()) != NULL)
			{
				// figure out if a view pane is selected
				CViewPane* pPane = (CViewPane*)GetControl(RUNTIME_CLASS(CViewPane));
				CViewDisplay* pVD = DYNAMIC_DOWNCAST(CViewDisplay, pPane);
				if(pVD != NULL)
					pPane = pVD->GetChildPane();

				// this updates the current search values so we can reference them
				// note we don't want to validate for other displays, since this
				// will typically fire the verify record event, which isn't
				// desireable here
				CViewSearchPane* pSearch = DYNAMIC_DOWNCAST(CViewSearchPane, pPane);
				if(pSearch != NULL)
					pSearch->DoValidation(TRUE);

				// bing:context - this should iterate through the client context instead
				// try to find a pane that actually handles the barcode scan event
				while(pPane != NULL)
				{
					IDSView* pView = pPane->GetCurrentView();
					int pos = pView->GetEvents()->FindEvent(
							EVENT_IDENTIFIER(BARCODE_SCAN_EVENT));
					if(pos >= 0)
					{
						// see if this event actually has any actions that are
						// enabled
						attributes = pPane->CreateAttributeBuilder();
						attributes->SetAttribute(DS_SCANNER_INPUT,
								CVariant(VARIANT_STRING, scanData));

						BOOL enabled = FALSE;
						CEventChain* pChain = pView->GetEvents()->GetEvent(pos);
						for(int index = 0; index < pChain->GetCount(); index++)
						{
							CString condition = pChain->GetAction(index)->GetCondition();
							if(condition.IsEmpty())
							{
								enabled = TRUE;
								break;
							}

							CParseTreeEvaluator evaluator;
							evaluator.SetAttributes(attributes);
							CError error;
							if(evaluator.EvaluateCondition(condition, error))
							{
								enabled = TRUE;
								break;
							}
						}

						if(enabled)
							break;
					}

					pPane = DYNAMIC_DOWNCAST(CViewPane, pPane->GetParent());
					attributes = NULL;
				}
			}

			// still need to create attributes if we didn't find a pane
			if(attributes == NULL)
			{
				attributes = m_pEngine->CreateAttributeBuilder(TRUE);
				attributes->SetAttribute(DS_SCANNER_INPUT,
						CVariant(VARIANT_STRING, scanData));
			}

			// fire the barcode scan event
			EVENT_IDENTIFIER id(BARCODE_SCAN_EVENT, scanData);
			CEventChainHandler handler(id, attributes);
			if(handler.ProcessChain(this) != ES_SUCCESS)
			{
				CError* pError = handler.GetContext()->GetError();
				if(pError != NULL)
					m_pEngine->DisplayError(*pError);
			}
		}
	}

	m_inFireEvents = FALSE;
}

// end CScannerPlugin internal functions
/////////////////////////////////////////////////////////////////////////////
