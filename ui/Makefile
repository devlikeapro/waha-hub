generate:
	. ${NVM_DIR}/nvm.sh && nvm exec yarn generate

copy-waha: generate
	rm -rf  ../../whatsapp-http-api/src/dashboard/*
	cp -Rv .output/public/* ../../whatsapp-http-api/src/dashboard/

copy-docs: generate
	rm -rf  ../../waha-docs/static/dashboard/*
	cp -Rv .output/public/* ../../waha-docs/static/dashboard/
