

ifeq ($(UNAME),Darwin)
	SHELL := /opt/local/bin/bash
	OS_X  := true
else ifneq (,$(wildcard /etc/redhat-release))
	RHEL := true
else
	OS_DEB  := true
	SHELL := /bin/bash
endif

say_hello:
	@echo "Hello Podverse"

.PHONY: install_prereq
install_prereq:
	@echo "Install brew packages"
	brew update
	brew install cocoapods node npm ruby watchman yarn
	@echo "Install user cocoapods"
	/opt/homebrew/Cellar/ruby/3.1.2_1/bin/gem install cocoapods --user-install

run_ios:
	npx react-native run-ios
	yarn dev

clean_kill_electron:
	@echo "Kill Electron"
	kill -9 $(pgrep Electron)

clean_kill_packager:
	@echo "Killing packager..."
	lsof -i :8081 | awk 'NR>1 {print $2}' | xargs kill -9

clean_kill_listeners:
	@echo "Killing listeners..."
	watchman watch-del-all

clean_android:
	echo "Cleaning android..."
	./gradlew clean 2>/dev/null

clean_ios:
	@echo "Cleaning ios..."
	rm -rf ~/Library/Developer/Xcode/DerivedData 2>/dev/null
	rm -rf ./ios/build 2>/dev/null
	rm -rf ./ios/Pods 2>/dev/null
	rm -rf ./ios/Podfile.lock 2>/dev/null

clean_node_modules:
	@echo "Clearing node modules..."
	rm -rf node_modules/
	yarn cache clean

clean_node_install:
	yarn install
	npx pod-install
	yarn postinstall

start_vscode:
	code .
	clear

.PHONY: clean clean_kill_packager clean_kill_listeners clean_android clean_ios clean_node_modules clean_node_install
clean: clean_kill_packager clean_kill_listeners clean_android clean_ios clean_node_modules clean_node_install

.PHONY: vcs_clean clean_kill_electron clean_kill_packager clean_kill_listeners clean_android clean_ios clean_node_modules clean_node_install start_vscode
vcs_clean: clean_kill_electron clean_kill_packager clean_kill_listeners clean_android clean_ios clean_node_modules clean_node_install start_code