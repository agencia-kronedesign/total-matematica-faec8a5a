-- Fix security issue: Remove public read access to atividades table
-- The "Visualização de atividades" policy with qual:true makes all activities publicly readable
-- This is a critical security vulnerability that exposes sensitive educational data

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Visualização de atividades" ON public.atividades;

-- The existing "Professores podem ver suas atividades" policy already provides proper access control:
-- - Professors can see their own activities
-- - Admins/coordinators/direction can see all activities  
-- - Students can see activities from classes they're enrolled in
-- This policy is sufficient and secure, so no replacement policy is needed