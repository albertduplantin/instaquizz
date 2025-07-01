# ⚡ InstaQuizz

Application web de quiz instantané pour professeurs. Créez vos classes, ajoutez vos questions et lancez des quiz avec tirage au sort équitable d'élèves en quelques clics !

## ✨ Fonctionnalités

### 🏫 Gestion des Classes
- Créer, modifier et supprimer des classes
- Ajouter et gérer la liste des élèves par classe
- Interface intuitive avec sélection facile

### ❓ Banque de Questions  
- Créer et organiser vos questions
- Recherche et filtrage des questions
- Modification et suppression faciles

### ⚡ Quiz Instantané
- Sélection de classe pour le cours
- Tirage au sort instantané d'un élève ET d'une question
- Notation instantanée (correct/incorrect)
- Équité garantie : chaque élève a les mêmes chances
- Ajout rapide d'élèves et questions depuis l'interface

### 📊 Statistiques Complètes
- Moyennes automatiques par élève (/20)
- Taux de réussite et nombre de questions
- Classement de la classe
- Export des résultats (copier-coller + CSV)
- Réinitialisation par classe

### 📱 Design Moderne
- Interface responsive (desktop, tablet, mobile)
- Menu burger pour mobile
- Design moderne et intuitif
- PWA (installable sur appareil)

## 🚀 Installation

### Prérequis
- Node.js 18+ 
- Compte Supabase (gratuit)

### 1. Cloner le projet
```bash
git clone <repository-url>
cd quiz3
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration Supabase

#### Créer un projet Supabase
1. Rendez-vous sur [supabase.com](https://supabase.com)
2. Créez un compte et un nouveau projet
3. Notez votre URL de projet et votre clé API anonyme

#### Configurer les variables d'environnement
Créez un fichier `.env.local` :
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Créer les tables en base
Dans l'interface Supabase, exécutez ces requêtes SQL :

```sql
-- Table des classes
CREATE TABLE classes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des élèves
CREATE TABLE students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des questions
CREATE TABLE questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des résultats de quiz
CREATE TABLE quiz_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    is_correct BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Politiques de sécurité RLS
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Politiques pour les classes
CREATE POLICY "Users can view their own classes" ON classes
    FOR SELECT USING (auth.uid() = teacher_id);
CREATE POLICY "Users can insert their own classes" ON classes
    FOR INSERT WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Users can update their own classes" ON classes
    FOR UPDATE USING (auth.uid() = teacher_id);
CREATE POLICY "Users can delete their own classes" ON classes
    FOR DELETE USING (auth.uid() = teacher_id);

-- Politiques pour les élèves
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

-- Politiques pour les questions
CREATE POLICY "Users can view their own questions" ON questions
    FOR SELECT USING (auth.uid() = teacher_id);
CREATE POLICY "Users can insert their own questions" ON questions
    FOR INSERT WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Users can update their own questions" ON questions
    FOR UPDATE USING (auth.uid() = teacher_id);
CREATE POLICY "Users can delete their own questions" ON questions
    FOR DELETE USING (auth.uid() = teacher_id);

-- Politiques pour les résultats de quiz
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
```

### 4. Lancer l'application
```bash
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

## 📦 Déploiement

### Netlify (Recommandé)
1. Connectez votre repository GitHub à Netlify
2. Configurez les variables d'environnement dans Netlify
3. Déployez automatiquement

### Vercel
1. Connectez votre repository à Vercel
2. Configurez les variables d'environnement
3. Déployez

## 🎯 Guide d'utilisation

### Première utilisation
1. **Créez un compte** via le formulaire d'inscription
2. **Créez vos classes** dans l'onglet "Classes"
3. **Ajoutez vos élèves** dans chaque classe
4. **Créez vos questions** dans l'onglet "Questions"

### Utilisation quotidienne
1. **Mode Quiz** : Sélectionnez une classe
2. **Tirage au sort** : Cliquez pour tirer un élève et une question
3. **Notation** : Cliquez "Correct" ou "Incorrect"
4. **Statistiques** : Consultez les moyennes et exportez les résultats

### Export des moyennes
- **Copier-coller** : Bouton "Copier" pour coller dans un tableur
- **Export CSV** : Fichier téléchargeable pour Excel/LibreOffice
- **Réinitialisation** : Remise à zéro des stats par classe

## 🛠️ Technologies utilisées

- **Frontend** : React 18 + TypeScript + Vite
- **Styling** : Tailwind CSS
- **Backend** : Supabase (PostgreSQL + Auth)
- **Icons** : Lucide React
- **PWA** : Service Worker + Manifest

## 📊 Fonctionnalités PWA

- ✅ Installable sur desktop et mobile
- ✅ Fonctionne hors ligne (après première visite)
- ✅ Interface native
- ✅ Mises à jour automatiques

## 🔒 Sécurité

- Authentification sécurisée via Supabase
- Politiques RLS (Row Level Security)
- Données isolées par professeur
- HTTPS obligatoire en production

## 🤝 Support

Pour toute question ou suggestion, créez une issue dans le repository.

---

**🎓 Quiz Prof** - Rendez vos cours plus interactifs !
