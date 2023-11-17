describe('demo-e2e', () => {
  beforeEach(() => cy.visit('/'));

  it('should display instructions', () => {
    cy.get('h1').should('exist');
  });
});
