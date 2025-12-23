-- Criar bucket para fotos de perfil
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Política para usuários visualizarem avatares (público)
CREATE POLICY "Avatares são públicos para visualização"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Política para usuários fazerem upload do próprio avatar
CREATE POLICY "Usuários podem fazer upload do próprio avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para usuários atualizarem o próprio avatar
CREATE POLICY "Usuários podem atualizar o próprio avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para usuários deletarem o próprio avatar
CREATE POLICY "Usuários podem deletar o próprio avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);