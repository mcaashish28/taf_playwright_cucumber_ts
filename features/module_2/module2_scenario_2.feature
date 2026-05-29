@regression
Feature: Playwright Docs - Writing Tests Page Content

  Scenario: Verify Writing Tests page contains key sections
    Given I navigate to the Writing Tests page
    Then I should see the "First test" section on the page
    And I should see the "Advanced Fixtures" section on the page
