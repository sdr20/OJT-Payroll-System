<!-- <template>
  <div class="login-container">
    <div class="login-box">
      <h1 class="logo">Payroll System</h1>
      <form @submit.prevent="login" class="login-form">
        <input 
          type="text" 
          v-model="username" 
          placeholder="Username"
          class="login-input"
          required 
        />
        <input 
          type="password" 
          v-model="password" 
          placeholder="Password"
          class="login-input"
          required 
        />
        <button type="submit" class="login-button">Log In</button>
      </form>
      <div class="forgot-password">
        <a href="#">Forgot password?</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #fafafa;
}

.login-box {
  background-color: white;
  padding: 40px;
  border: 1px solid #dbdbdb;
  border-radius: 1px;
  width: 350px;
}

.logo {
  text-align: center;
  margin-bottom: 30px;
  font-family: -apple-system, system-ui, "Segoe UI";
  font-size: 2rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.login-input {
  padding: 9px 0 7px 8px;
  background-color: #fafafa;
  border: 1px solid #dbdbdb;
  border-radius: 3px;
  font-size: 14px;
}

.login-button {
  background-color: #0095f6;
  color: white;
  padding: 8px;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
}

.login-button:hover {
  background-color: #0081d6;
}

.forgot-password {
  text-align: center;
  margin-top: 20px;
}

.forgot-password a {
  color: #00376b;
  text-decoration: none;
  font-size: 14px;
}
</style>

<script>
export default {
  name: 'UserLogin',
  data() {
    return {
      username: '',
      password: '',
    };
  },
  methods: {
    async login() {
      try {
        await this.$store.dispatch('login', {
          username: this.username,
          password: this.password,
        });
        const userRole = this.$store.state.user.role;
        if (userRole === 'admin') {
          this.$router.push('/admin');
        } else {
          this.$router.push('/employee');
        }
      } catch (err) {
        alert('Login failed');
      }
    },
  },
};
</script>

<style scoped>
.login {
  max-width: 300px;
  margin: auto;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style> -->