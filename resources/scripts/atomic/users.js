Atomic.namespace("Atomic.users");

Atomic.users = (function () {
    
    var viewModel = null;
    
    function User() {
        this.id = ko.observable("");
        this.name = ko.observable();
        this.manager = ko.observable(false);
        this.password1 = ko.observable();
        this.password2 = ko.observable();
        
        this.reset = function(id) {
            this.id(id);
            this.name("");
            this.password1("");
            this.password2("");
        };
        
        this.save = function(model) {
            var group = model.selectedGroup().name();
            var user = model.newUser;
            console.log("Creating user " + user.id());
            var data = {
                mode: "edit-user",
                id: user.id(),
                name: user.name(),
                password: user.password1(),
                group: group
            };
            $.ajax({
                url: "modules/users.xql",
                type: "POST",
                data: data,
                dataType: "json",
                success: function(data) {
                    if (data.status != "ok") {
                        Atomic.util.Dialog.error("Saving User Failed", data.message, "fa-exclamation");
                    } else {
                        model.newUser.reset("");
                        Atomic.users.loadGroups(group);
                    }
                }
            });
        };
    }
    
    function loadGroups(selected) {
        $.ajax({
            url: "modules/users.xql?mode=groups",
            type: "GET",
            dataType: "json",
            timeout: 10000,
            success: function(data) {
                if (data.status && data.status != "ok") {
                    Atomic.util.Dialog.error("Retrieving Groups Failed", data.message, "fa-exclamation");
                    return;
                }
                if (!viewModel) {
                    viewModel = ko.mapping.fromJS(data);
                    viewModel.selectedGroup = ko.observable();
                    viewModel.newGroup = {
                        name: ko.observable(),
                        description: ko.observable()
                    };
                    viewModel.addUser = ko.observable();
                    viewModel.newUser = new User();
                    viewModel.headers =
                        [
                            {title: 'User ID', sortPropertyName: 'id', ascending:  'true', arrowDown: ko.observable(false), arrowUp: ko.observable(true)},
                            {title: 'Name', sortPropertyName: 'name', ascending: 'true', arrowDown: ko.observable(false), arrowUp: ko.observable(false)},
                            {title: 'Manager', sortPropertyName: 'manager', ascending: 'true', arrowDown: ko.observable(false), arrowUp: ko.observable(false)},
                            {title: '', sortPropertyName: 'actions', ascending: 'true', arrowDown: ko.observable(false), arrowUp: ko.observable(false)}
                    ];
                    viewModel.activeSort = viewModel.headers[0];
                    viewModel.sort =
                        function(header, event) {
                            if (viewModel.activeSort === header) {
                                header.ascending = !header.ascending;
                                header.arrowDown(!header.arrowDown());
                                header.arrowUp(!header.arrowUp());
                            } else {
                                viewModel.activeSort.arrowDown(false);
                                viewModel.activeSort.arrowUp(false);
                                viewModel.activeSort = header;
                                viewModel.activeSort.ascending = true;
                                header.arrowDown(true);
                            }

                            var prop = viewModel.activeSort.sortPropertyName;
                            var ascSort = function(a,b) {var aProp = a[prop]().toLowerCase(); var bProp = b[prop]().toLowerCase(); return aProp < bProp ? -1 : aProp > bProp ? 1 : aProp == bProp ? 0 : 0; };
                            var descSort = function(a,b) {var aProp = a[prop]().toLowerCase(); var bProp = b[prop]().toLowerCase(); return aProp > bProp ? -1 : aProp < bProp ? 1 : aProp == bProp ? 0 : 0; };
                            
                            var sortFunc = viewModel.activeSort.ascending ? ascSort : descSort;

                            viewModel.selectedGroup().user.sort(sortFunc);
                    };

                    ko.applyBindings(viewModel);
                } else {
                    ko.mapping.fromJS(data, viewModel);
                }
                if (selected) {
                    console.log("selected: %s", selected);
                    $.each(viewModel.group(), function(i, group) {
                        if (group.label() == selected) {
                            viewModel.selectedGroup(group);
                        }
                    });
                }
            }
        });
    }
    
    function createGroup(model) {
        var name = model.newGroup.name();
        var description = model.newGroup.description();
        $.ajax({
            url: "modules/users.xql",
            type: "GET",
            data: { mode: "create-group", id: name, description: description },
            dataType: "json",
            success: function(data) {
                if (data.status != "ok") {
                    Atomic.util.Dialog.error("Group Creation Failed", data.message, "fa-exclamation");
                } else {
                    model.newGroup.name("");
                    model.newGroup.description("");
                    Atomic.users.loadGroups(name);
                }
            }
        });
    }
    
    function setManager(user) {
        var group = viewModel.selectedGroup().name();
        $.log("setting manager for group %s to %s", group, user.id());
        $.getJSON("modules/users.xql", { mode: "set-manager", id: user.id(), group: group, set: !user.manager()},
            function(data) {
                if (data.status != "ok") {
                    Atomic.util.Dialog.error("Changing Group Manager Failed", data.message, "fa-exclamation");
                } else {
                    $.log("changed group manager");
                }
            }
        );
    }
    
    function getLabel(item) {
        var name = item.label();
        if (item.description()) {
            return name + ' (' + item.description() + ')';
        } else {
            return name;
        }
    }
    
    function addUser(model) {
        var group = model.selectedGroup().name();
        var label = model.selectedGroup().label();
        var user = model.addUser();
        if (user) {
            $.log("Adding user %s to group %s", model.addUser(), group);
            $.getJSON("modules/users.xql", { mode: "add-user", id: escape(model.addUser()), group: group},
                function(data) {
                    if (data.status == "notfound") {
                        Atomic.util.Dialog.confirm("User Not Found", "User " + user + " does not exist. Create it?", function() {
                            model.newUser.reset(user);
                        });
                    } else {
                        Atomic.users.loadGroups(label);
                        model.addUser("");
                    }
                }
            );
        } else {
            Atomic.util.Dialog.error("Error", "No user specified!");
        }
    }
    
    function removeUser(item) {
        var group = viewModel.selectedGroup().name();
        var label = viewModel.selectedGroup().label();
        $.log("Removing user %s from group %s", item.id(), group);
        $.getJSON("modules/users.xql", { mode: "remove-user", id: item.id(), group: group},
            function(data) {
                Atomic.users.loadGroups(label);
                viewModel.addUser("");
            }
        );
    }
    
    function renameGroup(model) {
        var name = model.selectedGroup().label();
        $.getJSON("modules/users.xql", { mode: "rename-group", name: name, group: model.selectedGroup().name() },
            function(data) {
                if (data.status != "ok") {
                    Atomic.util.Dialog.error("Renaming Group Failed", data.message, "fa-exclamation");
                } else {
                    Atomic.users.loadGroups(name);
                }
            }
        );
    }
    
    function deleteGroup(model) {
        var name = model.selectedGroup().label();
        if (name == "users") {
            Atomic.util.Dialog.error("Delete Failed", "You cannot delete the users group", "fa-exclamation");
            return;
        }
        Atomic.util.Dialog.confirm("Delete Group", "Do you really want to delete group " + name + "?", function() {
            $.getJSON("modules/users.xql", { mode: "delete-group", group: model.selectedGroup().name() },
                function(data) {
                    if (data.status != "ok") {
                        Atomic.util.Dialog.error("Deleting Group Failed", data.message, "fa-exclamation");
                    } else {
                        Atomic.users.loadGroups();
                    }
                }
            );
        });
    }
    
    return {
        loadGroups: loadGroups,
        createGroup: createGroup,
        getLabel: getLabel,
        addUser: addUser,
        removeUser: removeUser,
        renameGroup: renameGroup,
        deleteGroup: deleteGroup,
        setManager: setManager
    };
})();

$(document).ready(function() {
     
    $('.typeahead').typeahead({
        items: 30,
        minLength: 2,
        source: function(query, callback) {
            $.getJSON("modules/users.xql?mode=users&q=" + query, function(data) {
                callback(data || []);
            });
        }
    });
    
    Atomic.users.loadGroups();
});