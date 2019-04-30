def label = "mypod-${UUID.randomUUID().toString()}"
podTemplate(label: label, containers: [
    containerTemplate(name: 'maven', image: 'maven:3.6.0-jdk-8-alpine', ttyEnabled: true, command: 'cat'),
    containerTemplate(name: 'node', image: 'node:lts-jessie', command: 'cat', ttyEnabled: true),
    containerTemplate(name: 'docker', image: 'docker', command: 'cat', ttyEnabled: true)
    ],
volumes: [
    hostPathVolume(mountPath: '/root/.m2/repository', hostPath: '/root/.m2/repository'),
    hostPathVolume(mountPath: '/home/jenkins/.m2', hostPath: '/home/jenkins/.m2'),
    hostPathVolume(mountPath: '/var/run/docker.sock', hostPath: '/var/run/docker.sock')
]) {
    node(label) {
        try {
            notifyBuild('STARTED')

            def myRepo = checkout scm
            def gitCommit = myRepo.GIT_COMMIT
            def gitBranch = myRepo.GIT_BRANCH
            def shortGitCommit = "${gitCommit[0..10]}"
            def previousGitCommit = sh(script: "git rev-parse ${gitCommit}~", returnStdout: true)
          def gitCommitCount = sh(script: "git rev-list --all --count", returnStdout: true)
            def regURL = "registry-sonatype-nexus.pipeline:8081/docker-internal"
            def regNamespace = "paruff"
            def artifactID = sh(script: "grep '<artifactId>' pom.xml | head -n 1 | sed -e 's/artifactId//g' | sed -e 's/\\s*[<>/]*//g' | tr -d '\\r\\n'", returnStdout: true)
            def POMversion = sh(script: "grep '<version>' pom.xml | head -n 1 | sed -e 's/version//g' | sed -e 's/\\s*[<>/]*//g' | tr -d '\\r\\n'", returnStdout: true)
          

            stage('Build Angular Project') {
                checkout scm
                container('node') {

                    stage('Install Node Packages') {
                        sh 'npm install'
                    }

                //    stage('Run Angular Lint') {
                //        sh 'ng lint'
                //    }

                    stage('Build') {
                        sh 'ng build --prod'
                    }

                    stage('SonarQube Analysis Angular') {
                        sh 'npm run sonar'
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
            docker tag ${regNamespace}/${artifactID} ${regNamespace}/${artifactID}:${POMversion}.${shortGitCommit}
            echo $gitBranch
            echo $branchName
            if [ ${gitBranch} == "origin/master" ] ; then
                docker tag ${regNamespace}/${artifactID} ${regNamespace}/${artifactID}:${POMversion}.${gitCommitCount}
                docker tag ${regNamespace}/${artifactID} ${regNamespace}/${artifactID}:${POMversion}.${BUILD_NUMBER}
            else
                docker tag ${regNamespace}/${artifactID} ${regNamespace}/${artifactID}:${branchName}-${POMversion}.${gitCommitCount}
                docker tag ${regNamespace}/${artifactID} ${regNamespace}/${artifactID}:${branchName}-${POMversion}.${BUILD_NUMBER}
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
            currentBuild.result = "FAILED"
            throw e
        } finally {
            // Success or failure, always send notifications
            notifyBuild(currentBuild.result)
        }     
    }
}


def notifyBuild(String buildStatus = 'STARTED') {
    // build status of null means successful
    buildStatus =  buildStatus ?: 'SUCCESSFUL'

    // Default values
    def colorName = 'RED'
    def colorCode = '#FF0000'
    def subject = "${buildStatus}: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'"
    def summary = "${subject} (${env.BUILD_URL})"

    // Override default values based on build status
    if (buildStatus == 'STARTED') {
        color = 'YELLOW'
        colorCode = '#FFFF00'
    } else if (buildStatus == 'SUCCESSFUL') {
        color = 'GREEN'
        colorCode = '#00FF00'
    } else {
        color = 'RED'
        colorCode = '#FF0000'
    }
    // Send notifications
    slackSend (color: "good", message: "Job: ${env.JOB_NAME} with buildnumber ${env.BUILD_NUMBER} was successful")
}