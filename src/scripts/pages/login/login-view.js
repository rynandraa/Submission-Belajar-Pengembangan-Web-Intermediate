export class LoginView {
  render() {
    return `
      <div class="view-container">
        <div class="auth-wrapper">
          <h2 class="content-title text-center">Login</h2>
          <div id="login-message" class="invalid-feedback mb-2" style="display:none; text-align:center;"></div>
          <form id="login-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" class="form-control" placeholder="Enter your email" required />
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" class="form-control" placeholder="Enter password (min 8 char)" minlength="8" required />
            </div>
            <button type="submit" id="login-submit" class="btn btn-block">Login</button>
          </form>
          <div style="margin-top: 16px; text-align: center; font-size: 0.875rem;">
            Don't have an account? <a href="#/register">Register</a>
          </div>
        </div>
      </div>
    `;
  }
}
