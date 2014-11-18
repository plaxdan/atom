using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Web;
using System.Web.Script.Serialization;

using DataSplice.Configuration;
using DataSplice.Data;
using DataSplice.Events;
using DataSplice.Plugins;
using DataSplice.Types;

namespace DataSplice.EsriDataSource
{
	public class FeatureDataSource : ServerDataSourceBase
	{
		protected Dictionary<ViewIdentifier, IDataSpliceView> m_views = new Dictionary<ViewIdentifier, IDataSpliceView>();

		private const string ServiceAddressOption = "Service Address";
		private const string LayerNameOption = "Layer Name";
		private const string LayerIdOption = "Layer ID";
		private const string WhereClauseOption = "Where Clause";

		private const string FeatureAttributesSection = "Feature Attributes";
		private const string AttributeNameOption = "Attribute Name";
		private const string DataTypeOption = "Data Type";
		private const string IncludeFeatureOption = "Include";
		private const string UniqueIdOption = "Unique ID";

		private const string GeoJsonField = "GeoJSON";
		private const string XMinBoundField = "X Min";
		private const string XMaxBoundField = "X Max";
		private const string YMinBoundField = "Y Min";
		private const string YMaxBoundField = "Y Max";

		public FeatureDataSource(EsriDataSourcePlugin plugin)
			: base(plugin)
		{
		}

		internal string GetServiceAddress(IDataSpliceView view)
		{
			string address = view.GetOptions().GetOption(ServiceAddressOption).Value.ToString();
			if (!String.IsNullOrEmpty(address) && !address.EndsWith("/"))
				address += "/";
			return address;
		}

		internal LayerInfo GetLayerInfo(IDataSpliceView view)
		{
			string name = (string)view.GetOptions().GetOption(LayerNameOption).Value;
			int id = (int)view.GetOptions().GetOption(LayerIdOption).Value;

			return new LayerInfo(name, id);
		}

		internal string GetWhereClause(IDataSpliceView view)
		{
			return (string)view.GetOptions().GetOption(WhereClauseOption).Value;
		}

		internal string[] GetIncludedAttributes(IDataSpliceView view)
		{
			var list = new List<string>();

			var options = (OptionCollection)view.GetOptions();
			var section = (ConfigurationSection)options.GetOptionValue(FeatureAttributesSection);
			foreach (OptionCollection attribute in section)
			{
				object include = attribute.GetOptionValue(IncludeFeatureOption);
				if ((include == null) || !(bool)include)
					continue;
				list.Add((string)attribute.GetOptionValue(AttributeNameOption));
			}

			return list.ToArray();
		}

		internal string GetUniqueIdAttribute(IDataSpliceView view)
		{
			var options = (OptionCollection)view.GetOptions();
			var section = (ConfigurationSection)options.GetOptionValue(FeatureAttributesSection);
			foreach (OptionCollection attribute in section)
			{
				object unique = attribute.GetOptionValue(UniqueIdOption);
				if ((unique != null) && (bool)unique)
					return (string)attribute.GetOptionValue(AttributeNameOption);
			}
			return null;
		}

		#region ServerDataSourceBase overrides

		public override IViewAdapter GetAdapter(IDataSpliceView view, IEventContext context)
		{
			return new ViewAdapter(this, view, context);
		}

		protected override void StoreInternalView(IDataSpliceView view)
		{
			m_views[view.Identifier] = view;
		}

		protected override IDataSpliceView GetInternalView(ViewIdentifier identifier)
		{
			IDataSpliceView view;
			if (m_views.TryGetValue(identifier, out view))
			{
				UpdateViewFields((DataSpliceView)view);
				return view;
			}
			else
				return null;
		}

		protected override void DeleteInternalView(ViewIdentifier identifier)
		{
			m_views.Remove(identifier);
		}

		protected override IDataSpliceView CreateBlankView(ViewIdentifier identifier)
		{
			var view = new DataSpliceView(ProviderName, identifier);
			view.SetOptions(CreateDefaultViewOptions());
			UpdateViewFields(view);
			return view;
		}

		protected override IDataSpliceView MergeViewSettings(IDataSpliceView source, IDataSpliceView target)
		{
			((DataSpliceView)target).SetOptions(CreateDefaultViewOptions());
			var merged = base.MergeViewSettings(source, target) as DataSpliceView;
			string address = GetServiceAddress(merged);

			var mergedOptions = (OptionCollection)merged.GetOptions();
			var nameOption = (ConfigurationOption)mergedOptions.GetOption(LayerNameOption);
			string[] layerNames;
			int selectedLayerIndex = -1;
			if (!String.IsNullOrEmpty(address))
			{
				var layers = GetServiceLayers(address);
				layerNames = new String[layers.Count];
				for (int index = 0; index < layers.Count; index++)
				{
					layerNames[index] = layers[index].Name;
					if (layerNames[index] == (string)nameOption.Value)
						selectedLayerIndex = layers[index].ID;
				}
			}
			else
				layerNames = new String[0];

			nameOption.SetValueList(layerNames, true);
			mergedOptions.SetOptionValue(LayerIdOption, selectedLayerIndex, true);

			var sourceOptions = (OptionCollection)source.GetOptions();
			var sourceAttributes = (ConfigurationSection)sourceOptions.GetOptionValue(FeatureAttributesSection);

			var mergedAttributes = (ConfigurationSection)mergedOptions.GetOptionValue(FeatureAttributesSection);
			mergedAttributes.Flags = ConfigurationSectionFlags.None;
			mergedAttributes.Clear();
			var includeAttributes = new List<AttributeInfo>();
			string uniqueIdAttribute = null;
			if (selectedLayerIndex >= 0)
			{
				var attributes = GetLayerFeatureAttributes(address, selectedLayerIndex);
				foreach (AttributeInfo info in attributes)
				{
					OptionCollection options;
					int pos = sourceAttributes.FindCollection(info.Name);
					if (pos >= 0)
					{
						options = (OptionCollection)sourceAttributes[pos];

						object include = options.GetOptionValue(IncludeFeatureOption);
						if ((include != null) && (bool)include)
						{
							includeAttributes.Add(info);

							if (!String.IsNullOrEmpty(uniqueIdAttribute))
								options.SetOptionValue(UniqueIdOption, false, true);
							else
							{
								object unique = options.GetOptionValue(UniqueIdOption);
								if ((unique != null) && (bool)unique)
									uniqueIdAttribute = info.Name;
							}
						}
						else
							options.SetOptionValue(UniqueIdOption, false, true);
					}
					else
					{
						options = new OptionCollection(mergedAttributes.GetTemplate());
						options.SetOptionValue(AttributeNameOption, info.Name, true);
					}

					options.SetOptionValue(DataTypeOption, info.DataType.ToString(), true);

					mergedAttributes.AppendCollection(options);
				}
			}
			mergedAttributes.Flags = ConfigurationSectionFlags.Fixed;

			UpdateAttributeFields(merged, includeAttributes.ToArray(), uniqueIdAttribute);

			return merged;
		}

		public override string ProviderName
		{
			get { return "ESRI Feature Data Source"; }
		}

		#endregion

		private OptionCollection CreateDefaultViewOptions()
		{
			var options = new OptionCollection();
			ConfigurationOption option;

			options.AddOption(new ConfigurationOption(ServiceAddressOption, OptionType.Text));
			options.AddOption(new ConfigurationOption(LayerNameOption, OptionType.Text));
			option = new ConfigurationOption(LayerIdOption, OptionType.Integer);
			option.Readonly = true;
			options.AddOption(option);
			options.AddOption(new ConfigurationOption(WhereClauseOption, OptionType.Text));

			var template = new OptionCollection();
			option = new ConfigurationOption(AttributeNameOption, OptionType.Text);
			option.Readonly = true;
			template.AddOption(option);
			option = new ConfigurationOption(DataTypeOption, OptionType.Text);
			option.Readonly = true;
			template.AddOption(option);

			template.AddOption(new ConfigurationOption(IncludeFeatureOption, OptionType.Boolean));
			template.AddOption(new ConfigurationOption(UniqueIdOption, OptionType.Boolean));

			var section = new ConfigurationSection(template, AttributeNameOption);
			section.Flags = ConfigurationSectionFlags.Fixed;
			options.AddOption(new ConfigurationOption(FeatureAttributesSection,
					OptionType.ConfigurationSection, section));

			return options;
		}

		private void UpdateViewFields(DataSpliceView view)
		{
			var fields = (IViewFieldCollectionAdvanced)view.Fields;

			EnsureField(fields, GeoJsonField, FieldDataType.String,
				delegate(ViewField field)
				{
					field.DataSize = 2048;
				});
			EnsureField(fields, XMinBoundField, FieldDataType.Decimal, null);
			EnsureField(fields, XMaxBoundField, FieldDataType.Decimal, null);
			EnsureField(fields, YMinBoundField, FieldDataType.Decimal, null);
			EnsureField(fields, YMaxBoundField, FieldDataType.Decimal, null);
		}

		private void UpdateAttributeFields(DataSpliceView view, AttributeInfo[] attributes,
				string uniqueId)
		{
			var fields = (IViewFieldCollectionAdvanced)view.Fields;

			var validNames = new List<string>();
			validNames.AddRange(new string[] {
				GeoJsonField,
				XMinBoundField,
				XMaxBoundField,
				YMinBoundField,
				YMaxBoundField,
			});
			foreach (AttributeInfo info in attributes)
			{
				validNames.Add(info.Name);
				int pos = fields.GetFieldIndex(info.Name);
				ViewField field;
				if (pos >= 0)
					field = (ViewField)fields.GetField(pos);
				else
				{
					field = new ViewField(info.Name);
					fields.AddField(field);
				}

				if (info.Name == uniqueId)
					field.Flags |= FieldFlags.PrimaryKey;
				else
					field.Flags &= ~FieldFlags.PrimaryKey;

				field.DataType = info.DataType;
				if(field.DataType == FieldDataType.String)
					field.DataSize = info.Length;
			}

			// remove fields no longer in the collection
			for (int index = 0; index < fields.FieldCount; index++)
			{
				if(!validNames.Contains(fields.GetField(index).Name))
				{
					fields.RemoveField(index);
					index--;
				}
			}
		}

		delegate void NewFieldDelegate(ViewField field);

		private ViewField EnsureField(IViewFieldCollectionAdvanced fields,
				string name, FieldDataType dataType, NewFieldDelegate newFieldHandler)
		{
			int pos = fields.GetFieldIndex(name);
			if (pos < 0)
			{
				var newField = new ViewField(name);
				if (newFieldHandler != null)
					newFieldHandler(newField);
				fields.AddField(newField);
				pos = fields.GetFieldIndex(name);
			}
			var field = fields.GetField(pos) as ViewField;
			field.DataType = dataType;
			return field;
		}

		internal struct LayerInfo
		{
			public LayerInfo(string name, int id)
			{
				Name = name;
				ID = id;
			}
			public string Name;
			public int ID;
		}
		private List<LayerInfo> GetServiceLayers(string serviceAddress)
		{
			var list = new List<LayerInfo>();

			var request = (HttpWebRequest)WebRequest.Create(serviceAddress + "?f=json");
			var response = request.GetResponse();
			using (var stream = response.GetResponseStream())
			{
				var reader = new StreamReader(stream);
				string json = reader.ReadToEnd();

				var serializer = new JavaScriptSerializer();
				serializer.MaxJsonLength = Int32.MaxValue;
				var graph = (Dictionary<string, object>)serializer.DeserializeObject(json);
				object temp;
				if (graph.TryGetValue("layers", out temp))
				{
					var layerList = temp as object[];
					foreach (Dictionary<string, object> layerInfo in layerList)
					{
						list.Add(new LayerInfo(layerInfo["name"].ToString(),
							(int)layerInfo["id"]));
					}
				}
			}
			return list;
		}

		internal struct AttributeInfo
		{
			public AttributeInfo(string name, FieldDataType dataType, int length)
			{
				Name = name;
				DataType = dataType;
				Length = length;
			}
			public string Name;
			public FieldDataType DataType;
			public int Length;
		}

		private List<AttributeInfo> GetLayerFeatureAttributes(string serviceAddress, int layerId)
		{
			var list = new List<AttributeInfo>();

			var request = (HttpWebRequest)WebRequest.Create(String.Format("{0}{1}?f=json", serviceAddress, layerId));
			var response = request.GetResponse();
			using (var stream = response.GetResponseStream())
			{
				var reader = new StreamReader(stream);
				string json = reader.ReadToEnd();

				var serializer = new JavaScriptSerializer();
				serializer.MaxJsonLength = Int32.MaxValue;
				var graph = (Dictionary<string, object>)serializer.DeserializeObject(json);
				{
					object temp;
					if (graph.TryGetValue("fields", out temp))
					{
						var fieldList = temp as object[];
						foreach (Dictionary<string, object> fieldInfo in fieldList)
						{
							string type = fieldInfo["type"].ToString();
							FieldDataType dataType;
							int length = 0;
							switch(type)
							{
								case "esriFieldTypeString":
									dataType = FieldDataType.String;
									length = (int)fieldInfo["length"];
									break;
								case "esriFieldTypeInteger":
									dataType = FieldDataType.Integer;
									break;
								case "esriFieldTypeOID":
									dataType = FieldDataType.Long;
									break;
								case "esriFieldTypeDouble":
									dataType = FieldDataType.Double;
									break;
								case "esriFieldTypeSingle":
									dataType = FieldDataType.Single;
									break;
								default:
									continue;
							}

							list.Add(new AttributeInfo(fieldInfo["name"].ToString(),
								dataType, length));
						}
					}
				}
			}

			return list;
		}

		class ViewAdapter : ViewAdapterBase
		{
			private FeatureDataSource m_dataSource;
			private IDataSpliceView m_view;

			class BoundingBox
			{
				public BoundingBox(Decimal x, Decimal y)
				{
					XMin = XMax = x;
					YMin = YMax = y;
				}

				public Decimal XMin;
				public Decimal XMax;
				public Decimal YMin;
				public Decimal YMax;

				public void Extend(BoundingBox box)
				{
					if (box.XMin < XMin)
						XMin = box.XMin;
					if (box.XMax > XMax)
						XMax = box.XMax;
					if (box.YMin < YMin)
						YMin = box.YMin;
					if (box.YMax > YMax)
						YMax = box.YMax;
				}
			}

			private string m_queryAddress;
			private string m_idAttribute;
			private string[] m_includeAttributes;

			private List<Dictionary<string, object>> m_responseFeatures;
			private bool m_exceededTransferLimit;
			private int m_fetchOffset;
			private int m_fetchCount;
			private string m_lastObjectID;

			public ViewAdapter(FeatureDataSource dataSource, IDataSpliceView view, IEventContext context)
				: base(context)
			{
				m_dataSource = dataSource;
				m_view = view;
			}

			#region ViewAdapterBase overrides

			public override void PrepareResultsetStream(IDataSpliceQuery query)
			{
				LayerInfo info = m_dataSource.GetLayerInfo(m_view);
				m_queryAddress = String.Format("{0}{1}/query",
					m_dataSource.GetServiceAddress(m_view), info.ID);
				m_idAttribute = m_dataSource.GetUniqueIdAttribute(m_view);
				if (String.IsNullOrEmpty(m_idAttribute))
					throw new DataSpliceException("Unique ID attribute is not defined");
				m_includeAttributes = m_dataSource.GetIncludedAttributes(m_view);

				m_fetchOffset = -1;
				m_fetchCount = 0;
			}

			public override IDataSpliceRecord FetchRecord()
			{
				if (m_responseFeatures == null)
					FetchNextFeatures();
				else if (m_fetchOffset >= m_responseFeatures.Count)
				{
					if (m_exceededTransferLimit)
						FetchNextFeatures();
					else
						return null;
				}

				var record = new DataSpliceRecord(m_view);
				var feature = m_responseFeatures[m_fetchOffset];
				var attributes = (Dictionary<string, object>)feature["attributes"];
				foreach (string attribute in m_includeAttributes)
					record.SetInitialValue(attribute, attributes[attribute]);

				if (feature.ContainsKey("geometry"))
				{
					var geometry = (Dictionary<string, object>)feature["geometry"];
					ConvertGeoJson(geometry, record);
				}

				m_fetchOffset++;
				m_lastObjectID = attributes[m_idAttribute].ToString();

				return record;
			}

			public override void GetRecordsetInfo(out int offset, out int total, out bool totalIsKnown)
			{
				offset = 0;
				total = m_fetchCount;
				totalIsKnown = !m_exceededTransferLimit;
			}

			public override void InsertRecord(IDataSpliceRecord record)
			{
				throw new NotImplementedException();
			}

			public override void UpdateRecord(IDataSpliceRecord record)
			{
				throw new NotImplementedException();
			}

			public override void DeleteRecord(IDataSpliceRecord record)
			{
				throw new NotImplementedException();
			}

			public override IDataSpliceView View
			{
				get { return m_view; }
			}

			#endregion

			void FetchNextFeatures()
			{
				string where = m_dataSource.GetWhereClause(m_view);
				if (!String.IsNullOrEmpty(m_lastObjectID))
				{
					if (!String.IsNullOrEmpty(where))
						where += " and ";
					where += String.Format("{0}>{1}", m_idAttribute, m_lastObjectID);
				}

				if (String.IsNullOrEmpty(where))
					where = "1=1";
				string query = String.Format("{0}?where={1}&outFields={2}&orderByFields={3}&outSR=4326&f=json",
					m_queryAddress, Uri.EscapeDataString(where), String.Join(",", m_includeAttributes),
					m_idAttribute);

				var request = (HttpWebRequest)WebRequest.Create(query);
				request.Timeout = 300000; // 5 minutes
				var response = request.GetResponse();
				using (var stream = response.GetResponseStream())
				{
					var reader = new StreamReader(stream);
					string json = reader.ReadToEnd();

					var serializer = new JavaScriptSerializer();
					serializer.MaxJsonLength = Int32.MaxValue;
					var graph = (Dictionary<string, object>)serializer.DeserializeObject(json);

					if (graph.ContainsKey("error"))
					{
						string message = graph["message"].ToString();
						throw new ApplicationException(message);
					}

					m_responseFeatures = new List<Dictionary<string, object>>();
					foreach (Dictionary<string, object> feature in (object[])graph["features"])
						m_responseFeatures.Add(feature);

					m_fetchOffset = 0;
					m_fetchCount += m_responseFeatures.Count;
					m_exceededTransferLimit = graph.ContainsKey("exceededTransferLimit");
				}
			}
			void ConvertGeoJson(Dictionary<string, object> geometry, DataSpliceRecord record)
			{
				string type = null;
				object coordinates = null;
				BoundingBox bbox;

				if (geometry.ContainsKey("x"))
				{
					type = "Point";
					var x = (Decimal)geometry["x"];
					var y = (Decimal)geometry["y"];
					bbox = new BoundingBox(x, y);

					coordinates = new object[] { x, y };
				}
				else if (geometry.ContainsKey("paths"))
				{
					var paths = (object[])geometry["paths"];
					if (paths.Length == 1)
					{
						type = "LineString";
						coordinates = paths[0];
					}
					else
					{
						type = "MultiLineString";
						coordinates = paths;
					}

					bbox = GetPathBounds(paths);
				}
								else if (geometry.ContainsKey("rings"))
								{
										var rings = (object[])geometry["rings"];
										type = "Polygon";
										coordinates = rings;
										bbox = GetRingBounds(rings);
								}
								// bing - handle other types of geometry object
								// See: geojson.org/geojson-spec.html#geometry-objects
								else
										return;

				record.SetInitialValue(XMinBoundField, bbox.XMin);
				record.SetInitialValue(XMaxBoundField, bbox.XMax);
				record.SetInitialValue(YMinBoundField, bbox.YMin);
				record.SetInitialValue(YMaxBoundField, bbox.YMax);

				var geoJson = new Dictionary<string, object>();
				geoJson["type"] = type;
				geoJson["coordinates"] = coordinates;

				var serializer = new JavaScriptSerializer();
				serializer.MaxJsonLength = Int32.MaxValue;
				record.SetInitialValue(GeoJsonField, serializer.Serialize(geoJson));
			}

						BoundingBox GetRingBounds(object[] ring)
						{
								BoundingBox bbox = null;
								foreach (object[] polygon in ring)
								{
										foreach (object[] path in polygon)
										{
												if (bbox == null)
												{
														bbox = GetPathBounds(path);
												}
												else
												{
														bbox.Extend(GetPathBounds(path));
												}
										}
								}
								return bbox;
						}

			BoundingBox GetPathBounds(object[] path)
			{
				BoundingBox bbox = null;

				if ((path.Length == 2) && (path[0] is Decimal))
					return new BoundingBox((Decimal)path[0], (Decimal)path[1]);
				else
				{
					bool first = true;
					for (int index = 0; index < path.Length; index++)
					{
						var item = (object[])path[index];
						var itemBounds = GetPathBounds(item);
						if (first)
						{
							bbox = itemBounds;
							first = false;
						}
						else
							bbox.Extend(itemBounds);
					}
				}

				return bbox;
			}
		}
	}
}
