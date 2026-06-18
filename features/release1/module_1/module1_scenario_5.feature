@regression @module_1 @add_remove
Feature: Add and Remove Elements

  Scenario: User adds and removes elements dynamically using test data
    Given I open the Add Remove Elements page
    When I add elements from test data "elementsToAdd"
    And I remove elements from test data "elementsToRemove"
    Then the remaining element count should be 1
