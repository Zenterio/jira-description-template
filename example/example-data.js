
if (typeof(zenterioDescriptionTemplateFunc) === 'undefined') {
    var zenterioDescriptionTemplateDataFunc;
    var zenterioDescriptionTemplateMessageFunc;
    (function() {
        var bugTemplate =
`h6. Preconditions
<description of precondition that must be met>

h6. Steps to reproduce
# <add steps>

h6. Expected result
<add expected result>

h6. Actual result
<add actual result>

h6. Links to relevant test streams
<add links>`

        var workItemTemplate =
`h6. Background


h6. Description


h6. Expected results
* `

        var workItemStoryTemplate =
        `As a *<role>*, I want *<goal/desire>* so that *<benefit>*.`

        var workItemScenarioTemplate =
`h6. Scenario <NAME>

GIVEN: <condition>
WHEN: <trigger/action>
THEN: <outcome/result>
h6. Acceptance Criteria`

        var tooltip = "click to insert template"

        zenterioDescriptionTemplateDataFunc = function() { return [
            new zenterio.TemplateGroup('Bug',
                [new zenterio.TemplateDefinition('bug', tooltip, bugTemplate)]),
            new zenterio.TemplateGroup(['Bug', 'Project A'],
                [new zenterio.TemplateDefinition('bug', tooltip, "Project A bug")]),
            new zenterio.TemplateGroup(['Bug', 'Project B'],
                [new zenterio.TemplateDefinition('bug', tooltip, "Project B bug")]),
            new zenterio.TemplateGroup('Work item',
                [new zenterio.TemplateDefinition('wi', 'Simple work item', workItemTemplate),
                 new zenterio.TemplateDefinition('story', 'User story', workItemStoryTemplate),
                 new zenterio.TemplateDefinition('scenario', 'BDD Scenario', workItemScenarioTemplate)
                ]),
            new zenterio.TemplateGroup('default',
                [new zenterio.TemplateDefinition('', tooltip, "")])
            ];
        };

        zenterioDescriptionTemplateMessageFunc = function() {
            return "Templates only work in text mode";
        };
    })()
}
