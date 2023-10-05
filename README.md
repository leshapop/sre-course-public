MTS sre-course homework leshapop@gmail.com
Student71

- You need create 6 VMs (etcd1,2,3;pgsql1,2;haproxy1). This configuration tested at Debian 11 and 12.
   - Install Ansible on one control node. RUN sudo apt update && sudo apt install -y python3-pip sshpass git
   - RUN sudo pip3 install ansible
- cd ./ansible/postgresql_cluster dir
- Edit inventory file and variables in /vars/main.yml
  - OPTIONAL: If you want store DB in another disk - create VM(pgsql nodes) with 2 disks and edit /vars/disks.yml (second disk is set /dev/sdb by default) 
  - OR LEAVE this by default (postgresql_data_dir:/var/lib/postgresql) in config files (Debian.yml) and go to #4
  - OPTIONAL: EDIT postgresql_data_dir: variable (for example /mnt/db) in /vars/Debian.yml
  - OPTIONAL: RUN ansible-playbook create_disks.yml and CHECK for all done and mounted well!
- RUN ansible all -m ping
- RUN ansible-playbook deploy_pgcluster.yml
- Next we need init db 'weather', RUN ansible-playbook init_db_weather_app.yml
- Install kubectl and HELM
  - curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
  - chmod 700 get_helm.sh
  - ./get_helm.sh
  - curl -LO https://dl.k8s.io/release/`curl -LS https://dl.k8s.io/release/stable.txt`/bin/linux/amd64/kubectl
  - chmod +x ./kubectl
  - sudo mv ./kubectl /usr/local/bin/kubectl
- cd ./kube/ and edit /weather-app/values.yaml
- Use your kubeconfig. (--kubeconfig)
- RUN ./dry-test and after ./deploy.sh
- Use scripts in ./kube/ to manage your kube cluster.
