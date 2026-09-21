
export const validarLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'El correo electronico es obligatorio' });
  }

  const emailLimpio = email.trim().toLowerCase();
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!regexEmail.test(emailLimpio)) {
    return res.status(400).json({ error: 'El formato del correo electronico no es valido' });
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'La contrasena es obligatoria' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'La contrasena debe tener al menos 6 caracteres' });
  }

  req.body.email = emailLimpio;
  next();
};
