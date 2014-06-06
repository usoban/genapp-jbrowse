/*
    AMD module that returns JavaScript class that inherits from JBrowse/Plugin class.

    JBrowse will create one instance of this class, which will persist during the entire time JBrowse is running.
    This class's constructor function is the entry point for your plugin's JavaScript code.
 */

define([
        'dojo/_base/declare',
        'JBrowse/Plugin'
    ],
    function(declare, JBrowsePlugin)
    {
        return declare(JBrowsePlugin,
        {
            constructor: function(args) {
                this.customize();
            },

            customize: function() {
                var browser = this.browser;

                browser.afterMilestone('initView', function() {
                    dojo.destroy(browser.menuBar);
                });
            }
        });
    }
);