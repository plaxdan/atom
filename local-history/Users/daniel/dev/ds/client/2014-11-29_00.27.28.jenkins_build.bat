call gulp clean --distpath ..\datasplice-suite\build\win32\release\Resources\WebClient --distpath ..\datasplice-suite\build\win32\release\Cef\www
call bower cache clean

call npm install
call bower install

call gulp ci --distpath ..\datasplice-suite\build\win32\release\Resources\WebClient --webapppath ..\datasplice-suite\build\win32\release\Cef\www
