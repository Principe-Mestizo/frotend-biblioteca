export interface IAuthResponse {
  access_token: string;
  token_type:   string;
  user:         User;
}

export interface User {
  id:           string;
  nombre:       string;
  tipo_usuario: string;
  email:        string;
}
