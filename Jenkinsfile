def label = "mypod-${UUID.randomUUID().toString()}"
podTemplate(label: label, containers: [
    containerTemplate(name: 'maven', image: 'maven:3.6.0-jdk-8-alpine', ttyEnabled: true, command: 'cat'),
    containerTemplate(name: 'node', image: 'node:lts-jessie', command: 'cat', ttyEnabled: true),
    containerTemplate(name: 'docker', image: 'docker', command: 'cat', ttyEnabled: true),
    containerTemplate(name: 'kubectl', image: 'lachlanevenson/k8s-kubectl:v1.8.8', command: 'cat', ttyEnabled: true),
    ],
volumes: [
    hostPathVolume(mountPath: '/home/jenkins/nodedist', hostPath: '/home/jenkins/nodedist'),
    hostPathVolume(mountPath: '/var/run/docker.sock', hostPath: '/var/run/docker.sock')
    ]) {
        node(label) {
            def myRepo = checkout scm
            def gitCommit = myRepo.GIT_COMMIT
            def gitBranch = myRepo.GIT_BRANCH
            def branchName = sh(script: "echo $gitBranch | cut -c8-", returnStdout: true)
            def shortGitCommit = "${gitCommit[0..10]}"
            def previousGitCommit = sh(script: "git rev-parse ${gitCommit}~", returnStdout: true)
            def gitCommitCount = sh(script: "git rev-list --all --count", returnStdout: true)
            def regURL = "registry-sonatype-nexus.pipeline:8081/docker-internal"
            def regNamespace = "paruff"
            def artifactID = sh(script: "grep -m1 name package.json | awk -F: '{ print \$2 }' | sed 's/[\", ]//g' | tr -d '\\r\\n'", returnStdout: true)
            def APPversion = sh(script: "grep -m1 version package.json | awk -F: '{ print \$2 }' | sed 's/[\", ]//g' | tr -d '\\r\\n'", returnStdout: true)
            
            try {
                notifySlack()

                stage('Build Angular Project') {
                    checkout scm
                    container('node') {

                        stage('Install Node Packages') {
                            sh 'npm install'
                        }

                        stage('Run Security Check') {
                            sh 'npm run audit'
                        }

                        stage('Run Angular Lint') {
                            sh 'npm run lint'
                        }

                        stage('Run Karma Tests') {
                            sh 'npm run cibuild'
                        }

                        stage('Sonar Scanner') {
                            sh 'npm run sonar'
                        }                        

                        stage('Build') {
                            sh 'npm run build'
                        }                          
                    }
                }
                stage('Create Docker images') {
                    container('docker') {
                        withCredentials([[$class: 'UsernamePasswordMultiBinding',
                        credentialsId: 'dockerreg',
                        usernameVariable: 'DOCKER_REG_USER',
                        passwordVariable: 'DOCKER_REG_PASSWORD']]) {
                        sh """
                            docker login -u ${DOCKER_REG_USER}  -p ${DOCKER_REG_PASSWORD}
                            docker build -t ${regNamespace}/${artifactID} .
                            docker tag ${regNamespace}/${artifactID} ${regNamespace}/${artifactID}:${APPversion}.${shortGitCommit}
                            echo $gitBranch
                            echo $branchName
                            if [ ${gitBranch} == "origin/master" ] ; then
                                docker tag ${regNamespace}/${artifactID} ${regNamespace}/${artifactID}:${APPversion}.${gitCommitCount}
                                docker tag ${regNamespace}/${artifactID} ${regNamespace}/${artifactID}:${APPversion}.${BUILD_NUMBER}
                            fi
                            if [ ${gitBranch} == "origin/develop" ] ; then
                                docker tag ${regNamespace}/${artifactID} ${regNamespace}/${artifactID}:develop-${POMversion}.${gitCommitCount}
                                docker tag ${regNamespace}/${artifactID} ${regNamespace}/${artifactID}:develop-${POMversion}.${BUILD_NUMBER}
                            fi
                            docker push ${regNamespace}/${artifactID}
                            """
                        }
                    }
                }
                stage('deploy 2 k8s') {
                    container('kubectl') {
                        sh "kubectl get pods"
                        sh "kubectl create deployment ${artifactID} --image=${regNamespace}/${artifactID}"
                        sh "kubectl expose deployment ${artifactID} --type=LoadBalancer --port=8080"
                    }
                }
            } catch (e) {
                // If there was an exception thrown, the build failed
                currentBuild.result = "FAILURE"
                throw e
            } finally {
                // Success or failure, always send notifications
                notifySlack(currentBuild.result)
            }     
        }
    }


def notifySlack(String buildStatus = 'STARTED') {
    // Build status of null means success.
    buildStatus = buildStatus ?: 'SUCCESS'

    def color

    if (buildStatus == 'STARTED') {
        color = '#D4DADF'
    } else if (buildStatus == 'SUCCESS') {
        color = '#BDFFC3'
    } else if (buildStatus == 'UNSTABLE') {
        color = '#FFFE89'
    } else {
        color = '#FF9FA1'
    }

    def msg = "${buildStatus}: `${env.JOB_NAME}` #${env.BUILD_NUMBER}"

    slackSend(color: color, message: msg)
 }
