"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var build_component_1 = require("./build/build.component");
var result_component_1 = require("./result/result.component");
var run_component_1 = require("./run/run.component");
var save_query_component_1 = require('./features/save/save.query.component');
var list_query_component_1 = require('./features/list/list.query.component');
var share_url_component_1 = require('./features/share/share.url.component');
var editorHook_1 = require("./shared/editorHook");
var appbase_service_1 = require("./shared/appbase.service");
var urlShare_1 = require("./shared/urlShare");
var error_modal_component_1 = require("./features/modal/error-modal.component");
var confirm_modal_component_1 = require("./features/confirm/confirm-modal.component");
var appselect_component_1 = require("./features/appselect/appselect.component");
var docsidebar_component_1 = require("./features/docSidebar/docsidebar.component");
var learn_component_1 = require("./features/learn/learn.component");
var storage_service_1 = require("./shared/storage.service");
var docService_1 = require("./shared/docService");
var AppComponent = (function () {
    function AppComponent(appbaseService, storageService, docService) {
        this.appbaseService = appbaseService;
        this.storageService = storageService;
        this.docService = docService;
        this.connected = false;
        this.initial_connect = false;
        this.detectChange = null;
        this.config = {
            url: "",
            appname: "",
            username: "",
            password: "",
            host: ""
        };
        this.savedQueryList = [];
        this.query_info = {
            name: '',
            tag: ''
        };
        this.sort_by = 'createdAt';
        this.sort_direction = true;
        this.searchTerm = '';
        this.searchByMethod = 'tag';
        this.sidebar = false;
        this.hide_url_flag = false;
        this.appsList = [];
        this.errorInfo = {};
        this.editorHookHelp = new editorHook_1.EditorHook({ editorId: 'editor' });
        this.responseHookHelp = new editorHook_1.EditorHook({ editorId: 'responseBlock' });
        this.errorHookHelp = new editorHook_1.EditorHook({ editorId: 'errorEditor' });
        this.urlShare = new urlShare_1.UrlShare();
        this.result_time_taken = null;
        this.version = '2.0';
        this.active = true;
        this.submitted = false;
        this.deleteItemInfo = {
            title: 'Confirm Deletion',
            message: 'Do you want to delete this query?',
            yesText: 'Delete',
            noText: 'Cancel'
        };
        this.defaultApp = {
            appname: '2016primaries',
            url: 'https://Uy82NeW8e:c7d02cce-94cc-4b60-9b17-7e7325195851@scalr.api.appbase.io'
        };
    }
    AppComponent.prototype.onSubmit = function () { this.submitted = true; };
    AppComponent.prototype.setDocSample = function (link) {
        this.docLink = link;
    };
    AppComponent.prototype.ngOnInit = function () {
        $('body').removeClass('is-loadingApp');
        // get data from url
        this.detectConfig(configCb.bind(this));
        function configCb(config) {
            this.setInitialValue();
            if (config && config === 'learn') {
                $('#learnModal').modal('show');
                this.initial_connect = true;
            }
            else {
                if (config && config.url && config.appname) {
                    this.setLocalConfig(config.url, config.appname);
                }
                this.getLocalConfig();
                this.getQueryList();
            }
        }
    };
    AppComponent.prototype.ngOnChanges = function (changes) {
        var prev = changes['selectedQuery'].previousValue;
        var current = changes['selectedQuery'].currentValue;
    };
    // detect app config, either get it from url or apply default config
    AppComponent.prototype.detectConfig = function (cb) {
        var config = null;
        var isDefault = window.location.href.indexOf('#?default=true') > -1 ? true : false;
        var isInputState = window.location.href.indexOf('input_state=') > -1 ? true : false;
        if (isDefault) {
            config = this.defaultApp;
            return cb(config);
        }
        else if (!isInputState) {
            return cb('learn');
        }
        else {
            this.urlShare.decryptUrl().then(function (data) {
                var decryptedData = data.data;
                if (decryptedData && decryptedData.config) {
                    cb(decryptedData.config);
                }
                else {
                    cb(null);
                }
            });
        }
    };
    //Get config from localstorage 
    AppComponent.prototype.getLocalConfig = function () {
        var url = this.storageService.get('mirage-url');
        var appname = this.storageService.get('mirage-appname');
        var appsList = this.storageService.get('mirage-appsList');
        if (url != null) {
            this.config.url = url;
            this.config.appname = appname;
            this.connect(false);
        }
        else {
            this.initial_connect = true;
        }
        if (appsList) {
            try {
                this.appsList = JSON.parse(appsList);
            }
            catch (e) {
                this.appsList = [];
            }
        }
    };
    // get query list from local storage
    AppComponent.prototype.getQueryList = function () {
        try {
            var list = this.storageService.get('queryList');
            if (list) {
                this.savedQueryList = JSON.parse(list);
                this.sort(this.savedQueryList);
            }
        }
        catch (e) { }
    };
    //Set config from localstorage
    AppComponent.prototype.setLocalConfig = function (url, appname) {
        this.storageService.set('mirage-url', url);
        this.storageService.set('mirage-appname', appname);
        var obj = {
            appname: appname,
            url: url
        };
        var appsList = this.storageService.get('mirage-appsList');
        if (appsList) {
            try {
                this.appsList = JSON.parse(appsList);
            }
            catch (e) {
                this.appsList = [];
            }
        }
        if (this.appsList.length) {
            this.appsList = this.appsList.filter(function (app) {
                return app.appname !== appname;
            });
        }
        this.appsList.push(obj);
        this.storageService.set('mirage-appsList', JSON.stringify(this.appsList));
    };
    AppComponent.prototype.setInitialValue = function () {
        this.mapping = null;
        this.types = [];
        this.selectedTypes = [];
        this.result = {
            resultQuery: {
                'type': '',
                'result': [],
                'final': "{}"
            },
            output: {},
            queryId: 1
        };
    };
    AppComponent.prototype.connectHandle = function () {
        if (this.connected) {
            this.initial_connect = true;
            this.connected = false;
            this.urlShare.inputs = {};
            this.urlShare.createUrl();
        }
        else {
            this.connect(true);
        }
    };
    AppComponent.prototype.hideUrl = function () {
        this.hide_url_flag = this.hide_url_flag ? false : true;
    };
    // Connect with config url and appname
    // do mapping request  
    // and set response in mapping property 
    AppComponent.prototype.connect = function (clearFlag) {
        this.connected = false;
        this.initial_connect = false;
        console.log(this.config);
        try {
            var APPNAME = this.config.appname;
            var URL = this.config.url;
            var urlsplit = URL.split(':');
            var pwsplit = urlsplit[2].split('@');
            this.config.username = urlsplit[1].replace('//', '');
            this.config.password = pwsplit[0];
            if (pwsplit.length > 1) {
                this.config.host = urlsplit[0] + '://' + pwsplit[1];
                if (urlsplit[3]) {
                    this.config.host += ':' + urlsplit[3];
                }
            }
            else {
                this.config.host = URL;
            }
            var self = this;
            this.appbaseService.setAppbase(this.config);
            this.appbaseService.getVersion().then(function (res) {
                try {
                    var data = res.json();
                    if (data && data.version && data.version.number) {
                        var version = data.version.number;
                        self.version = version;
                        if (self.version.split('.')[0] !== '2') {
                            self.errorShow({
                                title: 'Elasticsearch Version Not Supported',
                                message: 'Mirage only supports v2.x of Elasticsearch Query DSL'
                            });
                        }
                    }
                }
                catch (e) {
                    console.log(e);
                }
            }).catch(function (e) {
                console.log('Not able to get the version.');
            });
            this.appbaseService.get('/_mapping').then(function (res) {
                self.connected = true;
                var data = res.json();
                self.setInitialValue();
                self.finalUrl = self.config.host + '/' + self.config.appname;
                self.mapping = data;
                self.types = self.seprateType(data);
                self.setLocalConfig(self.config.url, self.config.appname);
                self.detectChange += "done";
                if (!clearFlag) {
                    var decryptedData = self.urlShare.decryptedData;
                    if (decryptedData.mapping) {
                        self.mapping = decryptedData.mapping;
                    }
                    if (decryptedData.types) {
                        self.types = decryptedData.types;
                    }
                    if (decryptedData.selectedTypes) {
                        self.selectedTypes = decryptedData.selectedTypes;
                        self.detectChange = "check";
                        setTimeout(function () { $('#setType').val(self.selectedTypes).trigger("change"); }, 300);
                    }
                    if (decryptedData.result) {
                        self.result = decryptedData.result;
                    }
                    if (decryptedData.finalUrl) {
                        self.finalUrl = decryptedData.finalUrl;
                    }
                }
                //set input state
                self.urlShare.inputs['config'] = self.config;
                self.urlShare.inputs['selectedTypes'] = self.selectedTypes;
                self.urlShare.inputs['result'] = self.result;
                self.urlShare.inputs['finalUrl'] = self.finalUrl;
                self.urlShare.createUrl();
                setTimeout(function () {
                    if ($('body').width() > 768) {
                        self.setLayoutResizer();
                    }
                    else {
                        self.setMobileLayout();
                    }
                    // self.editorHookHelp.setValue('');
                }, 300);
            }).catch(function (e) {
                self.initial_connect = true;
                var message = e.json().message ? e.json().message : '';
                self.errorShow({
                    title: 'Authentication Error',
                    message: " It looks like your app name, username, password combination doesn't match.\nCheck your url and appname and then connect it again."
                });
            });
        }
        catch (e) {
            this.initial_connect = true;
        }
    };
    // Seprate the types from mapping	
    AppComponent.prototype.seprateType = function (mappingObj) {
        var mapObj = mappingObj[this.config.appname].mappings;
        var types = [];
        for (var type in mapObj) {
            types.push(type);
        }
        return types;
    };
    AppComponent.prototype.newQuery = function (currentQuery) {
        var queryList = this.storageService.get('queryList');
        if (queryList) {
            var list = JSON.parse(queryList);
            var queryData = list.filter(function (query) {
                return query.name === currentQuery.name && query.tag === currentQuery.tag;
            });
            var query_1;
            if (queryData.length) {
                query_1 = queryData[0];
                this.connected = false;
                this.initial_connect = false;
                this.config = query_1.config;
                this.appbaseService.setAppbase(this.config);
                this.appbaseService.get('/_mapping').then(function (res) {
                    var _this = this;
                    var data = res.json();
                    this.finalUrl = this.config.host + '/' + this.config.appname;
                    this.setInitialValue();
                    this.connected = true;
                    this.result = query_1.result;
                    this.mapping = data;
                    this.types = this.seprateType(data);
                    this.selectedTypes = query_1.selectedTypes;
                    setTimeout(function () { $('#setType').val(_this.selectedTypes).trigger("change"); }, 300);
                }.bind(this));
                this.query_info.name = query_1.name;
                this.query_info.tag = query_1.tag;
                this.detectChange = "check";
            }
        }
    };
    AppComponent.prototype.deleteQuery = function (currentQuery) {
        this.currentDeleteQuery = currentQuery;
        $('#confirmModal').modal('show');
    };
    AppComponent.prototype.confirmDeleteQuery = function (confirmFlag) {
        if (confirmFlag && this.currentDeleteQuery) {
            var currentQuery = this.currentDeleteQuery;
            this.getQueryList();
            this.savedQueryList.forEach(function (query, index) {
                if (query.name === currentQuery.name && query.tag === currentQuery.tag) {
                    this.savedQueryList.splice(index, 1);
                }
            }.bind(this));
            this.filteredQuery.forEach(function (query, index) {
                if (query.name === currentQuery.name && query.tag === currentQuery.tag) {
                    this.filteredQuery.splice(index, 1);
                }
            }.bind(this));
            try {
                this.storageService.set('queryList', JSON.stringify(this.savedQueryList));
            }
            catch (e) { }
        }
        this.currentDeleteQuery = null;
    };
    AppComponent.prototype.clearAll = function () {
        this.setInitialValue();
        this.query_info = {
            name: '',
            tag: ''
        };
        this.detectChange += "check";
        this.editorHookHelp.setValue('');
    };
    AppComponent.prototype.sidebarToggle = function () {
        this.sidebar = this.sidebar ? false : true;
    };
    // save query
    AppComponent.prototype.saveQuery = function (inputQuery) {
        this.getQueryList();
        var createdAt = new Date().getTime();
        var currentQuery = {
            name: this.query_info.name,
            tag: this.query_info.tag,
            config: this.config,
            selectedTypes: this.selectedTypes,
            result: this.result,
            version: this.version
        };
        var queryData = inputQuery ? inputQuery : currentQuery;
        queryData.createdAt = createdAt;
        this.savedQueryList.forEach(function (query, index) {
            if (query.name === queryData.name && query.tag === queryData.tag) {
                this.savedQueryList.splice(index, 1);
            }
        }.bind(this));
        this.savedQueryList.push(queryData);
        this.sort(this.savedQueryList);
        var queryString = JSON.stringify(this.savedQueryList);
        try {
            this.storageService.set('queryList', JSON.stringify(this.savedQueryList));
        }
        catch (e) { }
        $('#saveQueryModal').modal('hide');
    };
    // Sorting by created At
    AppComponent.prototype.sort = function (list) {
        this.sort_by = 'createdAt';
        this.filteredQuery = list.sortBy(function (item) {
            return -item[this.sort_by];
        }.bind(this));
    };
    // Searching
    AppComponent.prototype.searchList = function (obj) {
        var searchTerm = obj.searchTerm;
        var searchByMethod = obj.searchByMethod ? obj.searchByMethod : 'tag';
        this.searchTerm = searchTerm;
        this.searchByMethod = searchByMethod;
        if (this.searchTerm.trim().length > 1) {
            this.filteredQuery = this.savedQueryList.filter(function (item) {
                return (item[this.searchByMethod] && item[this.searchByMethod].indexOf(this.searchTerm) !== -1) ? true : false;
            }.bind(this));
            if (!this.filteredQuery.length) {
                this.filteredQuery = this.savedQueryList.filter(function (item) {
                    return item.name.indexOf(this.searchTerm) !== -1 ? true : false;
                }.bind(this));
            }
        }
        else {
            this.filteredQuery = this.savedQueryList;
        }
        this.sort(this.filteredQuery);
    };
    AppComponent.prototype.setFinalUrl = function (url) {
        this.finalUrl = url;
        //set input state
        this.urlShare.inputs['finalUrl'] = this.finalUrl;
        this.urlShare.createUrl();
    };
    AppComponent.prototype.setProp = function (propInfo) {
        if (propInfo.name === 'finalUrl') {
            this.finalUrl = propInfo.value;
            this.urlShare.inputs['finalUrl'] = this.finalUrl;
        }
        if (propInfo.name === 'availableFields') {
            this.result.resultQuery.availableFields = propInfo.value;
            this.urlShare.inputs['result'] = this.result;
        }
        if (propInfo.name === 'selectedTypes') {
            this.selectedTypes = propInfo.value;
            this.urlShare.inputs['selectedTypes'] = this.selectedTypes;
        }
        if (propInfo.name === 'result_time_taken') {
            this.result_time_taken = propInfo.value;
        }
        //set input state
        this.urlShare.createUrl();
    };
    AppComponent.prototype.setLayoutResizer = function () {
        $('body').layout({
            east__size: "50%",
            center__paneSelector: "#paneCenter",
            east__paneSelector: "#paneEast"
        });
        function setSidebar() {
            var windowHeight = $(window).height();
            $('.features-section').css('height', windowHeight);
        }
        setSidebar();
        $(window).on('resize', setSidebar);
    };
    AppComponent.prototype.setMobileLayout = function () {
        var bodyHeight = $('body').height();
        $('#mirage-container').css('height', bodyHeight - 116);
        $('#paneCenter, #paneEast').css('height', bodyHeight);
    };
    AppComponent.prototype.setConfig = function (selectedConfig) {
        this.config.appname = selectedConfig.appname;
        this.config.url = selectedConfig.url;
    };
    AppComponent.prototype.errorShow = function (info) {
        var self = this;
        this.errorInfo = info;
        $('#errorModal').modal('show');
        var message = info.message;
        setTimeout(function () {
            if ($('#errorModal').hasClass('in')) {
                self.errorHookHelp.setValue(message);
            }
            else {
                setTimeout(function () {
                    self.errorHookHelp.setValue(message);
                }, 300);
            }
        }.bind(this), 500);
    };
    AppComponent.prototype.viewData = function () {
        var dejavuLink = this.urlShare.dejavuLink();
        window.open(dejavuLink, '_blank');
    };
    AppComponent.prototype.openLearn = function () {
        $('#learnModal').modal('show');
    };
    AppComponent = __decorate([
        core_1.Component({
            selector: 'my-app',
            templateUrl: './app/app.component.html',
            directives: [build_component_1.BuildComponent, result_component_1.ResultComponent, run_component_1.RunComponent, save_query_component_1.SaveQueryComponent, list_query_component_1.ListQueryComponent, share_url_component_1.ShareUrlComponent, appselect_component_1.AppselectComponent, error_modal_component_1.ErrorModalComponent, docsidebar_component_1.DocSidebarComponent, confirm_modal_component_1.ConfirmModalComponent, learn_component_1.LearnModalComponent],
            providers: [appbase_service_1.AppbaseService, storage_service_1.StorageService, docService_1.DocService]
        }), 
        __metadata('design:paramtypes', [appbase_service_1.AppbaseService, storage_service_1.StorageService, docService_1.DocService])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map