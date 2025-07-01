-- ===============================================
-- SCRIPT SQL POUR QUIZ PROF - SUPABASE SETUP
-- ===============================================

-- Table des classes
CREATE TABLE IF NOT EXISTS classes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des élèves
CREATE TABLE IF NOT EXISTS students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des questions (MODIFIÉE - avec class_id)
CREATE TABLE IF NOT EXISTS questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des résultats de quiz
CREATE TABLE IF NOT EXISTS quiz_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    is_correct BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- MIGRATION DES DONNÉES EXISTANTES (IMPORTANT !)
-- ===============================================

-- Si vous avez déjà des questions sans class_id, exécutez ceci APRÈS avoir créé au moins une classe :
-- 
-- UPDATE questions 
-- SET class_id = 'VOTRE_ID_DE_CLASSE_ICI'
-- WHERE class_id IS NULL AND teacher_id = auth.uid();
--
-- REMPLACEZ 'VOTRE_ID_DE_CLASSE_ICI' par l'ID d'une classe existante
-- Vous pouvez obtenir l'ID avec : SELECT id, name FROM classes WHERE teacher_id = auth.uid();

-- ===============================================
-- ACTIVATION DE LA SÉCURITÉ RLS (Row Level Security)
-- ===============================================

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- POLITIQUES DE SÉCURITÉ POUR LES CLASSES
-- ===============================================

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Users can view their own classes" ON classes;
DROP POLICY IF EXISTS "Users can insert their own classes" ON classes;
DROP POLICY IF EXISTS "Users can update their own classes" ON classes;
DROP POLICY IF EXISTS "Users can delete their own classes" ON classes;

-- Créer les nouvelles politiques
CREATE POLICY "Users can view their own classes" ON classes
    FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Users can insert their own classes" ON classes
    FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Users can update their own classes" ON classes
    FOR UPDATE USING (auth.uid() = teacher_id);

CREATE POLICY "Users can delete their own classes" ON classes
    FOR DELETE USING (auth.uid() = teacher_id);

-- ===============================================
-- POLITIQUES DE SÉCURITÉ POUR LES ÉLÈVES
-- ===============================================

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Users can view students in their classes" ON students;
DROP POLICY IF EXISTS "Users can insert students in their classes" ON students;
DROP POLICY IF EXISTS "Users can update students in their classes" ON students;
DROP POLICY IF EXISTS "Users can delete students in their classes" ON students;

-- Créer les nouvelles politiques
CREATE POLICY "Users can view students in their classes" ON students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM classes 
            WHERE classes.id = students.class_id 
            AND classes.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert students in their classes" ON students
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM classes 
            WHERE classes.id = students.class_id 
            AND classes.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Users can update students in their classes" ON students
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM classes 
            WHERE classes.id = students.class_id 
            AND classes.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete students in their classes" ON students
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM classes 
            WHERE classes.id = students.class_id 
            AND classes.teacher_id = auth.uid()
        )
    );

-- ===============================================
-- POLITIQUES DE SÉCURITÉ POUR LES QUESTIONS (MODIFIÉES)
-- ===============================================

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Users can view their own questions" ON questions;
DROP POLICY IF EXISTS "Users can insert their own questions" ON questions;
DROP POLICY IF EXISTS "Users can update their own questions" ON questions;
DROP POLICY IF EXISTS "Users can delete their own questions" ON questions;

-- Créer les nouvelles politiques pour questions par classe
CREATE POLICY "Users can view questions in their classes" ON questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM classes 
            WHERE classes.id = questions.class_id 
            AND classes.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert questions in their classes" ON questions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM classes 
            WHERE classes.id = questions.class_id 
            AND classes.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Users can update questions in their classes" ON questions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM classes 
            WHERE classes.id = questions.class_id 
            AND classes.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete questions in their classes" ON questions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM classes 
            WHERE classes.id = questions.class_id 
            AND classes.teacher_id = auth.uid()
        )
    );

-- ===============================================
-- POLITIQUES DE SÉCURITÉ POUR LES RÉSULTATS DE QUIZ
-- ===============================================

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Users can view quiz results for their students" ON quiz_results;
DROP POLICY IF EXISTS "Users can insert quiz results for their students" ON quiz_results;
DROP POLICY IF EXISTS "Users can delete quiz results for their students" ON quiz_results;

-- Créer les nouvelles politiques
CREATE POLICY "Users can view quiz results for their students" ON quiz_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM students 
            JOIN classes ON students.class_id = classes.id
            WHERE students.id = quiz_results.student_id 
            AND classes.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert quiz results for their students" ON quiz_results
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM students 
            JOIN classes ON students.class_id = classes.id
            WHERE students.id = quiz_results.student_id 
            AND classes.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete quiz results for their students" ON quiz_results
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM students 
            JOIN classes ON students.class_id = classes.id
            WHERE students.id = quiz_results.student_id 
            AND classes.teacher_id = auth.uid()
        )
    );

-- ===============================================
-- VUES UTILES POUR LES STATISTIQUES
-- ===============================================

-- Vue pour les statistiques par élève et par classe
CREATE OR REPLACE VIEW student_stats_by_class AS
SELECT 
    s.id as student_id,
    s.name as student_name,
    c.id as class_id,
    c.name as class_name,
    COUNT(qr.id) as total_questions,
    COUNT(CASE WHEN qr.is_correct = true THEN 1 END) as correct_answers,
    CASE 
        WHEN COUNT(qr.id) = 0 THEN 0 
        ELSE ROUND((COUNT(CASE WHEN qr.is_correct = true THEN 1 END)::numeric / COUNT(qr.id)) * 20, 2)
    END as average_score
FROM students s
JOIN classes c ON s.class_id = c.id
LEFT JOIN quiz_results qr ON s.id = qr.student_id
GROUP BY s.id, s.name, c.id, c.name
ORDER BY c.name, s.name;

-- ===============================================
-- CONFIGURATION TERMINÉE
-- ===============================================

-- Vérifier que les tables ont été créées
SELECT 
    'Tables créées avec succès!' as message,
    COUNT(*) as nombre_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('classes', 'students', 'questions', 'quiz_results'); 