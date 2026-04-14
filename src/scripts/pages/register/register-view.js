export class RegisterView {
  render() {
    return `
      <div class="view-container">
        <div class="auth-wrapper">
          <h2 class="content-title text-center">Register</h2>
          <div id="register-message" class="invalid-feedback mb-2" style="display:none; text-align:center;"></div>
          <form id="register-form">
            <div class="form-group">
              <label for="name">Name</label>
              <input type="text" id="name" class="form-control" placeholder="Enter your name" required />
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" class="form-control" placeholder="Enter your email" required />
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" class="form-control" placeholder="Create a password (min 8 char)" minlength="8" required />
            </div>
            <button type="submit" id="register-submit" class="btn btn-block">Register</button>
          </form>
          <div style="margin-top: 16px; text-align: center; font-size: 0.875rem;">
            Already have an account? <a href="#/login">Login</a>
          </div>
        </div>
      </div>
    `;
  }
}
