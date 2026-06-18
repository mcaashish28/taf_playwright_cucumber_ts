@regression @module_5 @broken_images
Feature: Broken Images

  Scenario: User counts the broken images on the page
    Given I open the Broken Images page
    Then the number of broken images should match test data "brokenImagesExpectedCountWrong"
