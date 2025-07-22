import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { Logo } from "../ui/Logo";
import { emailVerificationService } from "../../services/EmailVerificationService";

interface AuthProps {
  onLogin: (userData: { name: string; email: string; token: string }) => void;
}

export function SimpleAuth({ onLogin }: AuthProps) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`🚀 Starting ${isLogin ? 'login' : 'registration'} process...`);

    setLoading(true);
    setError("");

    // Validate form data
    if (!isLogin) {
      if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) {
        setError("Por favor, preencha todos os campos obrigatórios");
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirm_password) {
        setError("As senhas não coincidem");
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError("A senha deve ter pelo menos 6 caracteres");
        setLoading(false);
        return;
      }
    }

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      console.log(`📡 Making request to: http://localhost:8000${endpoint}`);

      let payload;
      if (isLogin) {
        payload = {
          email: formData.email,
          password: formData.password
        };
      } else {
        // Para registro, garantir que os campos obrigatórios estão presentes
        const baseUsername = `${formData.first_name.toLowerCase()}${formData.last_name.toLowerCase()}`
          .replace(/[^a-z0-9]/g, "")
          .substring(0, 15);
        const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const username = `${baseUsername}${randomSuffix}`;
        const displayId = Math.floor(Math.random() * 9000000000 + 1000000000).toString();

        payload = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          gender: null, // Permitir null para gender
          birth_date: null, // Permitir null para birth_date
          phone: null, // Permitir null para phone
          username: username,
          display_id: displayId,
        };
      }

      console.log("📦 Payload:", { ...payload, password: '***' });

      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log("Response status:", response.status);
      console.log("Response text:", responseText);

      if (response.ok) {
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          setError("Erro na resposta do servidor");
          return;
        }

        if (isLogin) {
          // Get user details for login
          const userResponse = await fetch("http://localhost:8000/auth/me", {
            headers: {
              Authorization: `Bearer ${data.access_token}`,
            },
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            onLogin({
              name: `${userData.first_name} ${userData.last_name}`,
              email: userData.email,
              token: data.access_token,
              id: userData.id,
            });
          } else {
            setError("Erro ao obter dados do usuário");
          }
        } else {
          // After registration, redirect to verification
          console.log("✅ Registration successful, processing...");

          try {
            // Store user data temporarily for verification process
            const userData = {
              id: data.id,
              firstName: data.first_name,
              lastName: data.last_name,
              email: data.email,
              username: data.username || payload.username,
              display_id: data.display_id || payload.display_id,
            };

            localStorage.setItem("pendingVerificationUser", JSON.stringify(userData));
            localStorage.setItem("pendingVerificationEmail", data.email);
            localStorage.setItem("pendingPassword", formData.password);

            console.log("📦 User data stored in localStorage");
            console.log("🔄 Redirecting to verification page...");

            // Show success message and navigate
            alert('Conta criada com sucesso! Redirecionando para verificação de e-mail...');

            // Use navigate instead of window.location.href
            setTimeout(() => {
              navigate('/verify-email');
            }, 100);

          } catch (storageError) {
            console.error("❌ Error storing user data:", storageError);
            // Fallback: still redirect to verification page
            alert('Conta criada! Redirecionando para verificação...');
            setTimeout(() => {
              navigate('/verify-email');
            }, 100);
          }
        }
      } else {
        // Handle registration/login error
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (jsonError) {
          console.error("Error parsing response JSON:", jsonError);
          errorData = { detail: "Erro na resposta do servidor" };
        }

        console.error("Registration/Login error:", errorData);
        setError(errorData.detail || "Erro ao processar solicitação");
      }
    } catch (error) {
      console.error("❌ Network or processing error:", error);
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center md:p-4">
      <div className="w-full max-w-md md:w-full">
        <div className="bg-white md:rounded-2xl md:shadow-xl p-6 md:p-8 min-h-screen md:min-h-0">
          {/* Logo */}
          <div className="text-center mb-8">
            <Logo size="lg" showText={true} />
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-4">
              {isLogin ? "Bem-vindo de volta!" : "Criar conta"}
            </h2>
            <p className="text-gray-600 mt-2 text-sm md:text-base">
              {isLogin
                ? "Entre na sua conta para continuar"
                : "Junte-se à nossa comunidade"}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      placeholder="Seu nome"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sobrenome
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      placeholder="Seu sobrenome"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 md:py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-base"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processando...
                </div>
              ) : isLogin ? (
                "Entrar"
              ) : (
                "Criar conta"
              )}
            </button>
          </form>

          {/* Forgot Password Link */}
          {isLogin && (
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/forgot-password')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Esqueci minha senha
              </button>
            </div>
          )}

          {/* Toggle Auth Mode */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm md:text-base">
              {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
              <button
                onClick={() => {
                  if (isLogin) {
                    // Redirecionar para cadastro em etapas
                    navigate("/cadastro");
                  } else {
                    setIsLogin(!isLogin);
                    setError("");
                    setFormData({
                      first_name: "",
                      last_name: "",
                      email: "",
                      password: "",
                      confirm_password: "",
                    });
                  }
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {isLogin ? "Criar conta" : "Fazer login"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
