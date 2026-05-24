import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SchoolLogo from '../../components/SchoolLogo.jsx';
import { isAuthenticated, login } from './authService.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Login gagal');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-brand">
          <SchoolLogo className="h-12 w-12" fallbackClassName="bg-emerald-500 text-slate-950" />
          <p>Sistem Nilai & Hafalan</p>
        </div>
        <h1 id="login-title">Masuk ke dashboard</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              autoComplete="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="button button-primary" type="submit" disabled={isLoading}>
            {isLoading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
        <p className="help-text">Lupa password? Hubungi admin sekolah.</p>
      </section>
    </main>
  );
}
