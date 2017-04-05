# Zenterio Jira Description Template

Issue Description Templates for Atlassian Jira

The solution is based on using jquery to manipulate the content of the description fields based on the selected issue type.

Please note that templates only work in standard text mode. If you use the
"what-you-see-is-what-you-get" (WYSIWYG) editor, the template mechanism will not work
correctly in the "visual" mode.

If you have enabled the "WYSIWYG"-editor, we suggest you make use of the message
mechanism to enlight your users of the fact. See the example for use.

The solution has been tested on Jira version v7.3.1

## License

See LICENSE


## Installation

1. Go to issue administration
1. Select Custom Fields
1. Create a custom field
1. Note the custom field ID and edit the custom field to modify its description

    * Add HTML element with ID `zenterio-description-template-script` and data attributes:

        - `data-zenterio-description-template-customfield-id` should have the value of the custom field ID.

        - `data-zenterio-description-template-data-function` should contain the name of a function that
        returns the template groups and definitions.

        - `data-zenterio-description-template-debug` is optional and should be set to
        true or false if used. If set to true, 'debug' messages are printed to the browser console.

        - `data-zenterio-description-template-message-function` is optional and if used, should
        be the name of a function that returns a string that will act as extra message
        to be printed together with the template buttons.

        - `data-zenterio-description-template-default-template` is optional and if used,
        should be a string with the name of the template group that should be the default
        template for issue types not matching any template group. See also Defining Templates below.

    * Add script tag sourcing a javascript file that defines the data function and
       optionally the message function referenced above.

    * Add script tag sourcing `zenterio.jira.description-template.js`

          <div id="zenterio-description-template-script"
             data-zenterio-description-template-customfield-id="NNN"
             data-zenterio-description-template-data-function="zenterioDescriptionTemplateDataFunc"
             data-zenterio-description-template-debug="true"
             data-zenterio-description-template-message-function="zenterioDescriptionTemplateMessageFunc"
             data-zenterio-description-template-default-template="default-template">
          </div>
          <script type="text/javascript" src="zenterio.jira.description-template.data.js"></script>
          <script type="text/javascript" src="zenterio.jira.description-template.js"></script>

1. Select the screens you want the templates available for by adding the custom field to
those screens. Since the template mechanism only is needed when creating the issue,
it is reasonable to only add the custom field to create, edit and possibly default screens.

**NOTE!**

If you have multiple field configurations, each one needs to be maintained with its
own field description.

**NOTE!**

Since jira has special handling of the script tag in field descriptions, you can
NOT place the data attributes and the id on any of the script tags you use to include
the JavaScript files.

Jira concatenates the content of all script tags placed in field descriptions and deliver them
batched in a single file at the beginning of the page.


## Defining Templates

The template handler takes a list of template groups defined and returned by a function
named according to the `data-zenterio-description-template-data-function` attribute, see above.

A template group is associated with an issue type and optionally a project.

A template group consists of a list of template definitions; each definition
consisting of a button text, tool-tip text and template text.

The first template definition is the default for that group.

If the button text is an empty string, no button will be created for that
definition.

If a group doesn't have any visible buttons, the extra message will not be shown either.

If a selected issue type doesn't match any of the registered template groups,
it will use the template group matched by the `default template` value which either
can be defined by the `data-zenterio-description-template-default-template` attribute.
If that data attribute is not present, it will use "default-template" as value for the default template.
If no template group is associated with default template, no template will be shown for the selected issue type.


## Examples

The example directory contains an index.html file that has similar behavior to
a jira create issue screen which also can be used to test your template definitions
and settings (data attributes).

The example-data.js file make use of the message function to provide a reminder to
the user that templates does not work with the WYSIWYG-editor.
