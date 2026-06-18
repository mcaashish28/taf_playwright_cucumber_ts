@regression @module_4 @frames
Feature: Nested Frames

  Scenario: User reads text from a nested frame
    Given I open the Nested Frames page
    Then the middle frame text should match test data "nestedFrameMiddleText"
