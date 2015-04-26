var app = angular.module('syn-gallery', ['ngMaterial']);

app.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default').accentPalette('grey', {
        'default': '200',
        'hue-1': '400',
        'hue-2': '800'
    }).primaryPalette('blue');
});

app.controller('loginCtrl', function($rootScope, $scope, $http, $mdToast, $document) {
    $scope.storage = ($rootScope.storage / 1024 / 1024).toFixed(1);
    $scope.login = function() {
        $http.post('/tpl/login', $scope.user).success(function(res) {
            $rootScope.items = res.items;
            $rootScope.isLogin = true;
        }).error(function(res, status) {
            if (status == 401) {
                $mdToast.show(
                    $mdToast.simple().content('账号或者密码错误！').position('top left').hideDelay(1500)
                );
            } else {
                $mdToast.show(
                    $mdToast.simple().content('网络异常！').position('top left').hideDelay(1500)
                );
            }
        });
    };
});

app.controller('galleryCtrl', function($rootScope, $scope, socket) {
    var gallery;
    socket.on('message', function(data) {
        gallery.items.push(data);
        gallery.invalidateCurrItems();
        gallery.updateSize(true);
        gallery.goTo(gallery.items.length - 1);
        gallery.ui.update();
    });
    var items = $rootScope.items,
        el = document.querySelectorAll('.pswp')[0],
        options = {
            history: false,
            index: items.length - 1,
            focus: false,
            escKey: false,
            closeOnScroll: false,
            closeOnVerticalDrag: false,
            clickToCloseNonZoomable: false,
            closeElClasses: [],
            closeEl: false,
            showAnimationDuration: 0,
            hideAnimationDuration: 0,
            scaleMode:'orig'
        };
    gallery = new PhotoSwipe(el, PhotoSwipeUI_Default, items, options);
    gallery.init();
});

app.service('socket', function() {
    // var socket = io('http://localhost:3001');
    var socket = io('http://zuyiner.com');
    this.socket = socket;
    this.on = function(evtname, fn) {
        socket.on(evtname, fn);
    };
    this.emit = function(evtname, data) {
        socket.emit(evtname, data);
    };
    this.send = function(data) {
        socket.send(data);
    };
});