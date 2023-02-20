
def debianBuildDockerImage
String dockerArgs = '-v  /var/run/docker.sock:/var/run/docker.sock --userns host --privileged -v $HOME:$HOME -e "HOME=${HOME}'

pipeline {
    agent { label "docker" }
    options { disableConcurrentBuilds() }
    environment {
        PROJECTNAME = "iink-js ${env.BRANCH_NAME}"
        PROJECTHOME = '/tmp/iink-js'
        PROJECT_DIR = "${WORKSPACE.replace('/var/jenkins_home/workspace','/dockervolumes/cloud/master/jenkins/workspace')}"
        APPLICATION_KEY = credentials('APPLICATION_KEY')
        HMAC_KEY =  credentials('HMAC_KEY')
        MAKE_ARGS =" PROJECT_DIR=${env.PROJECT_DIR} HOME=${env.PROJECTHOME} BUILDID=${env.BUILD_NUMBER} DEV_APPLICATIONKEY=${env.APPLICATION_KEY} DEV_HMACKEY=${env.HMAC_KEY} "
    }

    stages {

      stage('Build docker builder') {
        steps {
          script {
            debianBuildDockerImage = docker.build("iink-js.debian-builder:${env.BUILD_ID}",  '-f ./docker/builder/Dockerfile ./')
          }
        }
      }

      stage ('purge'){
        steps {
          script {
            debianBuildDockerImage.inside(dockerArgs) {
              sh "make ${env.MAKE_ARGS} purge"
            }
          }
        }
      }

      stage ('prepare'){
        steps {
          script {
            debianBuildDockerImage.inside(dockerArgs) {
              sh "make ${env.MAKE_ARGS} prepare"
              sh "make ${env.MAKE_ARGS} docker-wait-tcp"
            }
          }
        }
      }

      stage ('init_examples'){
        steps {
          script {
            debianBuildDockerImage.inside(dockerArgs) {
              sh "make ${env.MAKE_ARGS} docker-examples init_examples"
            }
          }
        }
      }

      stage('test browser with legacy server') {

        failFast false

        parallel {

          stage ('test-chromium'){
            steps {
              script {
                debianBuildDockerImage.inside(dockerArgs) {
                  sh "BROWSER=chromium make ${env.MAKE_ARGS} test-e2e"
                }
              }
            }
          }

          stage ('test-webkit'){
            steps {
              script {
                debianBuildDockerImage.inside(dockerArgs) {
                  sh "BROWSER=webkit make ${env.MAKE_ARGS} test-e2e"
                }
              }
            }
          }

          stage ('test-firefox'){
            steps {
              script {
                debianBuildDockerImage.inside(dockerArgs) {
                  sh "BROWSER=firefox make ${env.MAKE_ARGS} test-e2e"
                }
              }
            }
          }
        }

      }

      stage ('audit'){
          steps {
            script {
              debianBuildDockerImage.inside(dockerArgs) {
                sh "npm audit --production"
              }
            }
          }
      }
    }

    post {
        always {
             sh "make ${env.MAKE_ARGS} killdocker"
        }

        success {
            slackSend color: "good", message: "${env.PROJECTNAME}: Build success ${env.JOB_NAME} ${env.BUILD_NUMBER}."
        }
        unstable {
            slackSend color: "warning", message: "${env.PROJECTNAME}: Unstable build, ${currentBuild.fullDisplayName} is unstable"
        }
        failure {
            slackSend color: "danger", message: "@group ${env.PROJECTNAME}: FAILURE, ${currentBuild.fullDisplayName} failed see there ${env.BUILD_URL}"
        }
        /* changed {
            slackSend color: "good", message: "${env.PROJECTNAME}: Build changed"
        }*/
    }
}
