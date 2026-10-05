Feature: Create new user on Kayak website

  @create
  Scenario: Create new user
    Given I am on the Kayak homepage
    And I accept the cookie consent prompt
    When I land on Kayak English homepage
    And I accept the cookie consent prompt
    Then I click on the Sign in button
    And I choose to continue with email
    And I fill in the email field with a randomly generated email value
    And I proceed by signing in
    When I click on "Create your account" button
    Then I click on account menu
    And I click on "Confirm account" button
    And I type in the email address automatically generated for verification
    And I click on "Send" button
    Then I open the account confirmation link

  @create
  Scenario: Check new user is confirmed
    Given I am on the Kayak homepage
    And I accept the cookie consent prompt
    When I land on Kayak English homepage
    And I accept the cookie consent prompt
    Then I click on the Sign in button
    And I choose to continue with email
    And I fill in the email field with the random email address automatically generated beforehand
    And I proceed by signing in
    And I type in the verification code
    When I click on account menu
    Then I click on "Your account" menu item
    And I see my profile page
    Then I click on "Account" section
    And I edit my account information
      | FIELD        | VALUE    |
      | First name   | John     |
      | Last name    | Doe      |
      | Display name | John Doe |
    And I click on "Save" button
    When I reload the page
    Then I should see my profile page stating "Welcome back, John"