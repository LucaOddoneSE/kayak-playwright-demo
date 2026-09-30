Feature: Create new user on Kayak website

  @create
  Scenario: Create new user
    Given I am on the Kayak homepage
    And I accept the cookie consent prompt
    Then I land on Kayak English homepage
    And I accept the cookie consent prompt
    Then I click on the Sign in button
    And I choose to continue with email
    And I fill in the email field with a randomly generated email value
    Then I proceed by signing in
    When I create my account
    And I type in the verification code
    Then I click on account menu
    And I click on "Your account" menu item
    Then I see my profile page
    Then I click on "Account" section
    And I edit my account information
      | FIELD        | VALUE    |
      | First name   | John     |
      | Last name    | Doe      |
      | Display name | John Doe |
    And I click on "Save" button
    When I reload the page
    Then I should see my profile page stating "Welcome back, John"