function AppController($scope) {
    $scope.hello = '';
    // register
    $scope.message_reg = '';
    $scope.pwd1_reg = '';
    $scope.pwd2_reg = '';
    $scope.username_reg = '';
    // login
    $scope.message_login = '';
    $scope.pwd_login = '';
    $scope.username_login = '';
    $scope.session = '';
    //book
    $scope.query_book = '';
    $scope.search_items = [];
    $scope.message_search = '';
    //reading list
    $scope.reading_items = [];
    $scope.register = function() {
        if($scope.pwd1_reg != $scope.pwd2_reg) {
            $scope.message_reg = 'please input the same password!';
            return;
        }else if($scope.pwd1_reg == '' || $scope.pwd2_reg == '') {
            $scope.message_reg ='please input the password!';
            return;
        }else if($scope.username_reg == ''){
            $scope.message_reg = 'please input the username!';
            return;
        }
        $scope.message_reg = '';
        $.post('api/account/register', {
            username: $scope.username_reg,
            password: $scope.pwd2_reg
        }, function(result) {
            result = eval(result);
            console.log(result);
            if(result.status == false) {
                $scope.message_reg = result.message;
            }else {
                $scope.message_reg = 'register success, please login.'
            }
            $scope.$apply();
        });
    };
    $scope.login = function() {
        if($scope.username_login == '') {
            $scope.message_login = 'please input the username!';
            return;
        }else if($scope.pwd_login == '') {
            $scope.message_login = 'please input the password!';
            return;
        }
        $scope.message_login = '';
        $.post('api/account/login', {
            username: $scope.username_login,
            password: $scope.pwd_login
        }, function(result) {
            result = eval(result);
            console.log(result);
            if(result.status == false) {
                $scope.message_login = result.message;
                console.log($scope.message_login);
            }else {
                $scope.hello = 'hello, ' + $scope.username_login + ' ';
                $scope.session = result.session.sid;
            }
            $scope.$apply();
        });
        $scope.listItems();
    };
    $scope.search = function() {
        $scope.search_items = [];
        $scope.message_login = '';
        $.post('api/book/search', {
            'query': $scope.query_book
        }, function(result) {
            result = jQuery.parseJSON(result);
            console.log(result.items);
            $scope.search_items = result.items == undefined ? [] : result.items;
            for(var i=0; i<$scope.search_items.length; i++) {
                $scope.search_items[i]['liked'] = false;
            }
            if($scope.search_items.length == 0) {
                $scope.message_search = 'No Results.';
            }else {
                $scope.message_search = '';
            }
            $scope.$apply();
        });
    };
    $scope.addItem = function(idx) {
        var item = $scope.search_items[idx];
        $.ajax('api/book/add', {
            type: 'post',
            data: {
                'book': {
                    'kind': item.kind,
                    'volumeInfo': item.volumeInfo,
                    'searchInfo': item.searchInfo,
                    'saleInfo': item.saleInfo,
                    'accessInfo': item.accessInfo,
                    'id': item.id
                }
            }, 
            headers: { 'Session-Id': $scope.session },
            success: function(result){
                result = eval(result);
                if(result.status == true) {
                    item['liked'] = true;
                }else {
                    $scope.message_search = result['message'];
                }
                $scope.$apply();
            }
        });
        console.log($scope.session);
    };
    $scope.viewItem = function(mode, idx) {
        var item = null;
        if(mode == 'book')item = $scope.search_items[idx];
        else item = $scope.reading_items[idx];
        $scope.detail = item;
    };
    $scope.deleteItem = function(idx) {
        var item = $scope.reading_items[idx];
        $.ajax('api/book/delete', {
            type: 'post',
            data: {
                'book': item.id
            }, 
            headers: { 'Session-Id': $scope.session },
            success: function(result){
                result = eval(result);
                if(result.status == true) {
                    $scope.reading_items.splice(idx, 1);
                }else {
                    $scope.message_collection = result['message'];
                }
                $scope.$apply();
            }
        });
        console.log($scope.session);
        
    };
    $scope.listItems = function() {
        $.ajax('api/book/list', {
            type: 'get',
            data: {
            },
            headers: {'Session-Id': $scope.session },
            success: function(result) {
                if(result.status == false) {
                    $scope.message_collection = result.message;
                }else{
                    $scope.reading_items = result.items == undefined ? [] : result.items;
                    if($scope.reading_items.length == 0) $scope.message_collection = 'No Results';
                    else $scope.message_collection = '';
                }
                $scope.$apply();
            }
        });
    }
}
