const bcrypt = require('bcrypt');

class PasswordUtil {
  // Hash password
  static async hash(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  // Compare password with hash
  static async compare(password, hash) {
    return bcrypt.compare(password, hash);
  }

  // Validate password strength
  static validateStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }

    if (!hasUpperCase || !hasLowerCase) {
      return { valid: false, message: 'Password must contain both uppercase and lowercase letters' };
    }

    if (!hasNumbers) {
      return { valid: false, message: 'Password must contain at least one number' };
    }

    return { valid: true, message: 'Password is strong' };
  }
}

module.exports = PasswordUtil;
