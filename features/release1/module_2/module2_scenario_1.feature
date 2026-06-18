@regression @module_2 @dynamic_loading
Feature: Dynamic Loading

  Scenario: User waits for dynamically loaded content
    Given I open the Dynamic Loading page
    When I start the dynamic loading process
    Then the finish text should match test data "dynamicLoadingMessage"
