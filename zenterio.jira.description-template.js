// Global namespace objects
if (typeof(zenterio) === 'undefined') {
    zenterio = {};
}

(function() {
    "use strict";

    // set to true to turn on console logging
    var DEBUG = false;
    var JQUERY = AJS.$;

    var log = function() {
        try {
            if (DEBUG) {
                console.log.apply(console, arguments);
            }
        } catch (err) {
            // do nothing
        }
    }

    zenterio.data = zenterio.data || {};

    if (!zenterio.TemplateHandler) {

        /**
         *
         * @constructor
         * @param jquery JQuery instance
         * @param id     Instance Id, need to be unique not to conflict with pages
         *               with multiple templates.
         * @param customFieldId
         *               JQuery reference string to identify the DOM element/container for the
         *               custom field that holds the template code.
         * @param buttonContainer
         *               JQuery reference string to identify the DOM element/container that will
         *               hold the template option buttons.
         * @param triggers
         *               Array of JQuery reference strings,
         *               to identify the DOM element(s) which
         *               value(s) should determine which template group to show.
         *
         * @param destination
         *               JQuery reference to the DOM element which should be updated
         *               with a template value.
         * @param templateGroups
         *               List of TemplateGroups, holding the text template definitions.
         * @param defaultTemplate
         *               The name of the template that should be default if no issue type
         *               match exists in the template groups.
         * @param message
         *               Extra message always visible when templates are available.
         */
        var TemplateHandler = function(jquery, id, customFieldId, buttonContainer,
                triggers, destination, templateGroups, defaultTemplate, message) {
            log("Initializing TemplateHandler");
            var self = this;
            this.$ = jquery;
            this.customFieldId = customFieldId;
            this.buttonContainer = buttonContainer;
            this.id = id;
            zenterio.data[this.id] = {};
            this.triggers = triggers;
            this.destination = destination;
            this.templateGroups = {};
            this.message = message;
            templateGroups.forEach(function(item) {
                self.addTemplateGroup(item);
            });
            this.defaultTemplate = defaultTemplate || false;
            this.currentTemplateGroup = false;
            this.setLastUsedTemplate("");
            this.clickCallBack = function(triggerValues, templateId) {
                log("TemplateHandler.clickCallBack");
                self.applyTemplate(true, templateId);
            };
            this.eventListenerUpdate = function() {
                log("TemplateHandler.eventListenerUpdate");
                self.update();
            }
            this.regEventListeners();
            this.update();
        };

        TemplateHandler.prototype.getTriggersReference = function() {
            return this.triggers.join(',');
        };

        TemplateHandler.prototype.getNumberOfTriggers = function() {
            return this.triggers.length;
        };

        TemplateHandler.prototype.hideCustomField = function() {
            this.$(this.customFieldId).hide();
        };

        TemplateHandler.prototype.regEventListeners = function() {
            var self = this;
            self.$('body').delegate(this.getTriggersReference(), 'change', self.eventListenerUpdate);
        };

        TemplateHandler.prototype.update = function() {
            log("TemplateHandler.update")
            var self = this;
            var doUpdate = function() {
                if (self.hasCorrectContext()) {
                    self.hideCustomField();
                    self.addButtonsToContainer();
                    self.applyTemplate(false);
                }
            };
            if (this.hasCorrectContext()) {
                doUpdate();
            } else {
                this.$(this.getTriggersReference() + "," +
                       this.destination + "," +
                       this.customFieldId).ready(doUpdate);
            }
        };



        TemplateHandler.prototype.addTemplateGroup = function(templateGroup) {
            var templateGroupId = templateGroup.getTriggerValuesId();
            this.templateGroups[templateGroupId] = templateGroup;
        }

        TemplateHandler.prototype.addButtonsToContainer = function() {
            log("TemplateHandler.addButtonsToContainer");
            var self = this;
            var $container = null;
            var groupId = this.id + "-buttons"
            var $buttonGroup = null;
            if (this.$("#" + groupId).length === 0) {
                $container = this.$(this.buttonContainer);
                $buttonGroup = this.$('<span>', { id: groupId });
                this.$.each(this.templateGroups, function(triggerValues, templateGroup) {
                    var $tg = templateGroup.createDomFragment(self.$, self.clickCallBack, self.message);
                    $buttonGroup.append($tg);
                    templateGroup.hide();
                });
                $container.append($buttonGroup);
            }
        };

        TemplateHandler.prototype.applyTemplate = function(force, templateId) {
            log("TemplateHandler.applyTemplate");
            if (!this.hasCorrectContext) {
                log("(Not correct context, aborting applyTemplate)");
                return;
            }
            var newTriggers = this.getTriggerValues();
            var newTemplate = this.getTemplate(newTriggers, templateId);
            var lastUsedTemplate =  this.getLastUsedTemplate();
            this.updateTemplateButtons(newTriggers);
            this.updateDestinationValue(newTemplate, lastUsedTemplate, force);
        };

        TemplateHandler.prototype.hasCorrectContext = function() {
            log("TemplateHandler.hasCorrectContext");
            return (this.$(this.getTriggersReference()).length >= this.getNumberOfTriggers() &&
                    this.$(this.destination).length > 0 &&
                    this.$(this.customFieldId).length > 0);
        };

        TemplateHandler.prototype.getTemplateGroup = function(triggerValues) {
            log("TemplateHandler.getTemplateGroup");
            var id = triggerValues.join('-');
            return this.templateGroups[id] ||
                this.templateGroups[triggerValues[0]] ||
                this.templateGroups[this.defaultTemplate];
        }

        TemplateHandler.prototype.updateTemplateButtons = function(triggerValues) {
            log("TemplateHandler.updateTemplateButtons");
            if (this.currentTemplateGroup) {
                this.currentTemplateGroup.hide();
            }
            this.currentTemplateGroup = this.getTemplateGroup(triggerValues);
            if (this.currentTemplateGroup) {
                this.currentTemplateGroup.show();
            }
        };

        TemplateHandler.prototype.getTemplate = function(triggerValues, templateId) {
            log("TemplateHandler.getTemplate");
            var templateGroup = this.getTemplateGroup(triggerValues);
            if (templateGroup) {
                return templateGroup.getTemplate(templateId);
            } else {
                return undefined;
            }
        };

        TemplateHandler.prototype.getDestinationValue = function() {
            log("TemplateHandler.getDestinationValue");
            return this.$(this.destination).val();
        };

        TemplateHandler.prototype.setDestinationValue = function(newVal) {
            log("TemplateHandler.setDestinationValue (newVal=" + newVal + ")");
            this.$(this.destination).val(newVal);
        };

        TemplateHandler.prototype.updateDestinationValue = function(newTemplate, oldTemplate, force) {
            log("TemplateHandler.updateDestinationValue");
            var curVal = this.getDestinationValue();
            var newVal = curVal; // <- for security in case of programming error
            log("(newTemplate=" + newTemplate +")");
            log("(oldTemplate=" + oldTemplate + ")");
            log("(curVal=" + curVal + ")");

            if (!this.shouldUpdateBeDone(curVal, newTemplate, oldTemplate, force)) {
                log("(should not update, aborting updateDestinationValue)");
                return;
            }

            if (this.shouldCleanUpdateBeDone(curVal, oldTemplate)) {
                log("(clean update done)");
                newVal = newTemplate;
            } else if (this.shouldInplaceUpdateBeDone(curVal, oldTemplate, force)) {
                log("(inplace update done)");
                newVal = curVal.replace(oldTemplate, newTemplate);
            }

            if (curVal !== newVal) {
                log("(newVal=" + newVal + ")");
                this.setDestinationValue(newVal);
                this.setLastUsedTemplate(newTemplate);
            } else {
                log("(Nothing to update, exiting updateDestinationValue)");
            }
        };

        TemplateHandler.prototype.shouldUpdateBeDone = function(curVal, newTemplate, oldTemplate, force) {
            log("TemplateHandler.shouldUpdateBeDone");
            if (curVal === newTemplate) {
                log("(current template equals new template - no update)")
                return false;
            }
            if (oldTemplate === "" && this.stripppedOfWhiteSpace(curVal) !== "") {
                log("(old template has no value and current value does - no update)")
                return false;
            }
            if ((this.stripppedOfWhiteSpace(curVal) !== "") &&
                (this.stripppedOfWhiteSpace(curVal) !== this.stripppedOfWhiteSpace(oldTemplate)) &&
                !force) {
                log("(current value not equal to old template hence user update (and not force) - no update)")
                return false;
            }
            return true;
        }

        TemplateHandler.prototype.shouldCleanUpdateBeDone = function(curVal, oldTemplate) {
            log("TemplateHandler.shouldCleanUpdateBeDone");
            return ((curVal === '') ||
                    (curVal === oldTemplate) ||
                    (this.stripppedOfWhiteSpace(curVal) === this.stripppedOfWhiteSpace(oldTemplate)));
        };

        TemplateHandler.prototype.shouldInplaceUpdateBeDone = function(curVal, oldTemplate, force) {
            log("TemplateHandler.shouldInplaceUpdateBeDone");
            return  (force && (curVal.indexOf(oldTemplate) >= 0));
        };

        TemplateHandler.prototype.clearDestinationValue = function() {
            log("TemplateHandler.clearDestinationValue");
            this.setDestinationValue('');
        };

        TemplateHandler.prototype.getTriggerValues = function() {
            var result = [];
            var self = this;
            this.$.each(this.triggers, function(index, trigger) {
                result.push(self.$(trigger).val());
            });
            log("TemplateHandler.getTriggerValues (val=" + result + ")");
            return result;
        };

        TemplateHandler.prototype.getLastUsedTemplate = function() {
            var result = zenterio.data[this.id].lastUsedTemplate
            log("TemplateHandler.getLastUsedTemplate (val=" + result + ")");
            return result;
        };

        TemplateHandler.prototype.setLastUsedTemplate = function(value) {
            log("TemplateHandler.setLastUsedTemplate (val=" + value + ")");
            zenterio.data[this.id].lastUsedTemplate = value;
        };

        TemplateHandler.prototype.stripppedOfWhiteSpace = function(value) {
            log("TemplateHandler.stripppedOfWhiteSpace (val=" + value + ")");
            return value.replace(/\s/g, '')
        };

        zenterio.TemplateHandler = TemplateHandler;

        /**
         *
         * @constructor
         * @param button String no whitespaces or special characters
         * @param tooltip
         * @param content
         * @returns
         */
        var TemplateDefinition = function(button, tooltip, content) {
            log("Initilizing TemplateDefinition");
            this.button = button;
            this.tooltip = tooltip;
            this.content = content;
            this.buttonId = "button" + this.button;
            this.tooltipId = "tooltip" + this.button;
        };

        zenterio.TemplateDefinition = TemplateDefinition;

        /**
         * @constructor
         * @param triggerValues
         * @param templateDefinitions
         */
        var TemplateGroup = function(triggerValues, templateDefinitions) {
            log("Initilizing TemplateGroup");
            if (Array.isArray) {
                if (!Array.isArray(triggerValues)) {
                    triggerValues = [triggerValues];
                }
            } else {
                if (!triggerValues instanceof Array) {
                    triggerValues = [triggerValues];
                }
            }
            this.triggerValues = triggerValues;
            this.templates = {};
            this.$templateGroup = false;
            this.defaultTemplate = "";
            var self = this;
            if (templateDefinitions) {
                templateDefinitions.forEach(function(item) {
                    self.addTemplateDefinition(item);
                });
            }

        };

        TemplateGroup.prototype.addTemplateDefinition = function(templateDefinition) {
            log("TemplateGroup.addTemplateDefinition");
            var templateId = templateDefinition.button;
            this.templates[templateId] = templateDefinition;
            if (this.defaultTemplate === "") {
                this.defaultTemplate = templateDefinition.content;
            }
        };

        TemplateGroup.prototype.getDefault = function() {
            log("TemplateGroup.getDefault");
            return this.defaultTemplate;
        }

        TemplateGroup.prototype.getTemplate = function(templateId) {
            log("TemplateGroup.getTemplate");
            var td = this.templates[templateId];
            if (td) {
                return td.content;
            } else {
                return this.getDefault();
            }
        }

        TemplateGroup.prototype.hide = function() {
            log("TemplateGroup.hide");
            if (this.$templateGroup) {
                this.$templateGroup.hide();
            }

        };

        TemplateGroup.prototype.show = function() {
            log("TemplateGroup.show");
            if (this.$templateGroup) {
                this.$templateGroup.show();
            }
        };

        TemplateGroup.prototype.getTriggerValuesId = function() {
            return this.triggerValues.join('-');
        };

        TemplateGroup.prototype.createDomFragment = function($, clickCallBack, message) {
            log("TemplateGroup.createDomFragment");
            var self = this;
            var groupId = 'zenterio-template-group-' + this.getTriggerValuesId();
            var groupAttr = {
                id: groupId,
                style: "position: relative; display: inline"
            };
            var $templateGroup = $('<span>');
            $templateGroup.attr(groupAttr);
            var buttonAttr = {
                style: "position: relative; display: inline-block" +
                    "padding: 2px; margin: 0px 2px;background: #BBB; font-weight: bold;" +
                    "cursor: pointer; border-radius: 3px; font-family:monospace;"
            };
            var tooltipAttr =  {
                style: "padding: 2px; background-color: #000; background-color: hsla(0, 0%, 20%, 0.9);" +
                    "color: #fff; z-index: 1000; position: absolute; border-radius: 3px;" +
                    "top:1.5em; left:0.5em;"
            };

            var messageAttr = {
                style: "position: relative; display: inline-block" +
                    "padding: 2px; margin: 0px 2px; " +
                    "color: #000; font-family:monospace;"
            };

            if (message) {
                var $message = $('<span>' + message + '</span><br/>');
                $message.attr(messageAttr);
                $templateGroup.append($message);
            }

            var hasTemplateButtons = false;
            $.each(this.templates, function(templateId, templateDefinition) {
                if (this.button) {
                    var buttonId = groupId + '-button-' + templateId;
                    var tooltipId = groupId + '-tooltip-' + templateId;
                    var $button = $('<span>' + this.button + '</span>');
                    $button.attr(buttonAttr);
                    $button.attr('id', buttonId);
                    var $tooltip = $('<span>' + this.tooltip + '</span>');
                    $tooltip.attr(tooltipAttr);
                    $tooltip.attr('id', tooltipId);
                    $tooltip.hide();
                    $templateGroup.append($button);
                    $button.append($tooltip);
                    $button.mouseenter(function() { $tooltip.show() });
                    $button.mouseleave(function() { $tooltip.hide() });
                    $button.click(function() { clickCallBack(self.triggerValues, templateDefinition.button);  });
                    hasTemplateButtons = true;
                }
            });
            if (hasTemplateButtons) {
                this.$templateGroup = $templateGroup;
            } else {
                $templateGroup.remove();
            }
            return this.$templateGroup;
        };

        zenterio.TemplateGroup = TemplateGroup;
    }

    if (!zenterio.templateSetter) {
        var $data = JQUERY("#zenterio-description-template-script");
        DEBUG = (true === $data.data('zenterio-description-template-debug'));
        var customFieldId = $data.data('zenterio-description-template-customfield-id');
        var templateDataFunc = $data.data('zenterio-description-template-data-function');
        var templateMessageFunc = $data.data('zenterio-description-template-message-function');
        var defaultTemplateName = $data.data('zenterio-description-template-default-template');

        var templateFunc = window[templateDataFunc];
        var messageFunc = function() { return ""; }
        if (templateMessageFunc) {
            messageFunc = window[templateMessageFunc];
        }
        if (typeof defaultTemplateName === "undefined") {
            defaultTemplateName = "default-template"
        }

        log("zenterio.templateSetter (customFieldId=" + customFieldId + ")");
        log("zenterio.templateSetter (defaultTemplateName=" + defaultTemplateName + ")");
        log("zenterio.templateSetter (templateDataFunc=" + templateDataFunc + ")");
        log("zenterio.templateSetter (templateMessageFunc=" + templateMessageFunc + ")");

        zenterio.templateSetter =
            new zenterio.TemplateHandler(JQUERY,
                                         'zenterio-description-template-handler', /* id */
                                         '.field-group:has(#customfield_' + customFieldId + ')', /* custom field div */
                                         '.field-group:has(#description):first', /*  */
                                         ['#issuetype-field', '#project-field'],
                                         '#description',
                                         templateFunc(),
                                         defaultTemplateName,
                                         messageFunc());
    } else {
        zenterio.templateSetter.update();
    }
})();
