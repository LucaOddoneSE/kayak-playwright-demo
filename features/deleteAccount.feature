Feature: Delete the account that was automatically created on Kayak website
  @delete
  Scenario: Delete account
    Given I am on the Kayak homepage
    And I accept the cookie consent prompt
    When I land on Kayak English homepage
    And I accept the cookie consent prompt
    And I log in with the previously generated account if it exists, otherwise I create a new one
    Then I click on account menu
    And I click on "Your account" menu item
    Then I see my profile page
    Then I click on "Account" section
    And I click on "Delete Account"
    And I confirm the action by clicking on "Delete account" button
    When I open the account deletion confirmation link
    Then I should land on the account deletion confirmation page showing the message "Sorry to see you go"