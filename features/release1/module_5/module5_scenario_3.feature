@regression @module_5 @disappearing
Feature: Disappearing Elements

  Scenario: User verifies an expected menu item is present
    Given I open the Disappearing Elements page
    Then the menu should contain test data "disappearingExpectedItem"
