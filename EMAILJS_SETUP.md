# 📧 Configuration EmailJS pour InstaQuizz

## 🎯 **ÉTAPES DE CONFIGURATION :**

### **1. Créer un compte EmailJS**
1. Allez sur [emailjs.com](https://emailjs.com)
2. Cliquez sur "Sign Up" et créez un compte gratuit
3. Vérifiez votre email

### **2. Connecter un service email**
1. Dans le dashboard, allez dans **"Email Services"**
2. Cliquez sur **"Add New Service"**
3. Choisissez **Gmail** (ou votre service préféré)
4. Suivez les instructions pour connecter votre compte Gmail
5. **Notez le SERVICE_ID** (ex: `service_xxxxxxx`)

### **3. Créer un template d'email**
1. Allez dans **"Email Templates"**
2. Cliquez sur **"Create New Template"**
3. Utilisez ce template :

```
Sujet: Nouveau message de support - {{subject}} ({{priority}})

Bonjour,

Vous avez reçu un nouveau message de support depuis InstaQuizz :

Nom: {{from_name}}
Email: {{from_email}}
Sujet: {{subject}}
Priorité: {{priority}}

Message:
{{message}}

---
Répondre directement à: {{reply_to}}
```

4. **Notez le TEMPLATE_ID** (ex: `template_xxxxxxx`)

### **4. Obtenir la clé publique**
1. Allez dans **"Account"** → **"General"**
2. **Copiez la PUBLIC_KEY** (ex: `xxxxxxxxxxxxxxx`)

### **5. Configurer les variables d'environnement**

Ajoutez ces variables dans Vercel :

```
VITE_EMAILJS_PUBLIC_KEY = votre_public_key
VITE_EMAILJS_SERVICE_ID = votre_service_id  
VITE_EMAILJS_TEMPLATE_ID = votre_template_id
```

### **6. Tester la configuration**

1. Redéployez l'application
2. Allez sur la page Support
3. Envoyez un message de test
4. Vérifiez que vous recevez l'email

## 🔧 **CONFIGURATION AVANCÉE (Optionnelle) :**

### **Template de confirmation utilisateur**
Créez un second template pour confirmer la réception :

```
Sujet: Confirmation de réception - InstaQuizz

Bonjour {{to_name}},

Nous avons bien reçu votre message de support et nous vous répondrons dans les plus brefs délais.

Votre message :
{{message}}

Cordialement,
L'équipe InstaQuizz
```

## 📋 **VARIABLES DISPONIBLES DANS LES TEMPLATES :**

- `{{from_name}}` : Nom de l'expéditeur
- `{{from_email}}` : Email de l'expéditeur  
- `{{subject}}` : Sujet du message
- `{{message}}` : Contenu du message
- `{{priority}}` : Priorité (low/medium/high)
- `{{to_email}}` : Email de destination
- `{{reply_to}}` : Email de réponse

## 🚨 **DÉPANNAGE :**

### **Erreur "Invalid public key"**
- Vérifiez que la PUBLIC_KEY est correcte
- Assurez-vous qu'elle est bien dans les variables d'environnement

### **Erreur "Service not found"**
- Vérifiez le SERVICE_ID
- Assurez-vous que le service est bien activé

### **Erreur "Template not found"**
- Vérifiez le TEMPLATE_ID
- Assurez-vous que le template est publié

### **Emails non reçus**
- Vérifiez les spams
- Vérifiez que le service email est bien connecté
- Testez avec un autre email

## ✅ **UNE FOIS CONFIGURÉ :**

1. **Redéployez** l'application
2. **Testez** l'envoi d'un message
3. **Vérifiez** que vous recevez les emails
4. **Configurez** les notifications de votre boîte email

Votre système de contact sera alors **100% fonctionnel** ! 🎉


