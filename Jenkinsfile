// ========================================
// Jenkins Pipeline للـ Reservation System
// ========================================
// دا ملف تعليمات Jenkins بسيط جداً
// كل مرة تضغط Push ياخد الكود ويشتغل الخطوات دي:
// ========================================

pipeline {
    agent any
    
    tools {
        nodejs 'node20' 
    }
    
    
    environment {
        PORT = '9090'
        DB_USER = 'postgres'
        DB_NAME = 'reservation_db'
        DB_HOST = 'localhost' 
        DB_PORT = '5430'
        
        DB_PASSWORD = credentials('db-password-id')
        JWT_SECRET  = credentials('jwt-secret-id')
    }
    
    options {
        timestamps()
    }
    
    stages {
        stage('pull code from GitHub') {
            steps {
                echo 'Pulling code from GitHub...'
                checkout scm
            }
        }
        
        stage('install npm packages') {
            steps {
                echo 'installing npm packages...'
                sh 'npm ci'
            }
        }
        
        stage('install and run tests') {
            steps {
                echo 'starting tests'
                sh 'npm test'
            }
        }
        
        // مرحلة 4: بناء Docker images (صور التطبيق و قاعدة البيانات)
        stage('4-Docker Images') {
            steps {
                echo '--- جاري بناء Docker Images (API + Database) ---'
                sh 'docker-compose build'
                echo '✅ تم البناء بنجاح!'
            }
        }
        
    }
    
    // لما تخلص كل المراحل
    post {
        success {
            echo '✅✅✅ JENKINS PIPELINE تمام التمام! ✅✅✅'
            echo 'كل المراحل شتغلت بدون مشاكل'
        }
        
        failure {
            echo '❌❌❌ حصلت مشكلة! ❌❌❌'
            echo 'شوف الـ logs فوق عشان تعرف المشكلة'
        }
    }
}