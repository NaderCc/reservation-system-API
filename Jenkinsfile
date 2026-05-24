// ========================================
// Jenkins Pipeline للـ Reservation System
// ========================================

pipeline {
    agent any
    
    tools {
        nodejs 'node20' 
        dockerTool 'docker20' 
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
        
        stage('4-Docker Compose Deploy') {
            steps {
                echo '--- جاري التشغيل باستخدام الـ docker-compose الموثوق من الـ Tools ---'
                sh 'docker-compose up -d --build'
            }
        }
    } // القوس ده بيقفل الـ stages هنا بالظبط!

    // الـ post هنا جوه الـ pipeline وصح 100%
    post {
        success {
            echo '✅✅✅ JENKINS PIPELINE تمام التمام! ✅✅✅'
            echo 'كل المراحل اشتغلت بدون مشاكل والـ Containers قايمة ومنورة!'
        }
        
        failure {
            echo '❌❌❌ حصلت مشكلة! '
            echo 'شوف الـ logs فوق عشان تعرف المشكلة'
        }
    }
} // القوس النهائي للـ pipeline