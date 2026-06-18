@regression @module_5 @dynamic_controls
Feature: Dynamic Controls

  Scenario: User enables a disabled input and types into it
    Given I open the Dynamic Controls page
    When I enable the input and type test data "dynamicControlsInputText"
    Then the dynamic input value should match test data "dynamicControlsInputText"
