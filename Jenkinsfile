// ========================================
// Jenkins Pipeline for Reservation System
// ========================================
// 
// PREREQUISITES (Required Setup Before Starting):
// ================================================
// 1. Node.js 20 Tool Installation:
//    - Navigate to Jenkins Dashboard > Manage Jenkins > Tools > NodeJS
//    - Click Add NodeJS and name it "node20"
//    - Select Node 20.x from available versions
//
// 2. Docker Tool Installation:
//    - Navigate to Jenkins Dashboard > Manage Jenkins > Tools > Docker
//    - Click Add Docker and name it "docker20"
//    - Select the latest available Docker version
//
// 3. Docker Socket Permissions (Critical for Jenkins Container):
//    - Execute the following command on the host machine:
//     - docker exec -u root -it (docker_container_name) bash
//    - chmod 666 /var/run/docker.sock
//    - This grants Jenkins container permission to access Docker daemon
//
// 4. Jenkins Credentials Setup:
//    - Create credential "db-password-id" with database password
//    - Create credential "jwt-secret-id" with JWT secret key
//
// EXECUTION INSTRUCTIONS:
// ================================================
// docker-compose up -d
// - Starts all services: PostgreSQL + API + Jenkins
// 
// Access Jenkins at http://localhost:8080
// Create a new Pipeline job with GitHub repository URL
// Pipeline will automatically execute all stages
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
        stage('1-pull code from GitHub') {
            steps {
                echo 'Pulling code from GitHub...'
                checkout scm
            }
        }
        
        stage('2-install npm packages') {
            steps {
                echo 'Installing npm packages...'
                sh 'npm ci'
            }
        }
        
        stage('3-install and run tests') {
            steps {
                echo 'Running unit tests...'
                sh 'npm test'
            }
        }
        
        stage('4-Docker Compose Deploy') {
            steps {
                echo 'Checking and Deploying API...'
                script {
                    sh '''
                        if [ "$(docker ps -aq -f name=reservation_api)" ]; then
                            echo "Container reservation_api exists..."
                        else
                            sh 'docker-compose up'
                        fi
                    '''
                }
            }
        }
        
        stage('5-Health Check') {
            steps {
                echo 'Skipping docker-compose restart (Jenkins runs in container)'
                sh 'docker images | grep reservation-api'
            }
        }
    } 
    
    post {
        success {
            echo 'Pipeline execution completed successfully'
            echo 'Reservation System API is running'
            echo 'Access API at: http://localhost:9090'
            echo 'Database: postgres://localhost:5430'
        }
        
        failure {
            echo 'Pipeline execution failed'
            echo 'Review the logs above for error details'
            sh 'docker-compose logs'
        }
        
        always {
            echo 'Pipeline execution finished'
        }
    }
} 