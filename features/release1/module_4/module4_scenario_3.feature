@regression @module_4 @windows
Feature: Multiple Windows

  Scenario: User opens a new window and reads its content
    Given I open the Multiple Windows page
    When I open the new window
    Then the new window heading should match test data "windowNewWindowTextWrong"
