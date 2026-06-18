@regression @module_3 @slider
Feature: Horizontal Slider

  Scenario: User sets the horizontal slider to a target value
    Given I open the Horizontal Slider page
    When I set the slider to test data "sliderTargetValue"
    Then the slider value should match test data "sliderTargetValue"
