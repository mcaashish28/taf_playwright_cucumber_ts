@regression @module_2 @iframe
Feature: iFrame Editor

  Scenario: User types text inside an iframe editor using test data
    Given I open the iFrame page
    When I type test data "iframeText" into the iframe editor
    Then the iframe editor should contain test data "iframeText"
