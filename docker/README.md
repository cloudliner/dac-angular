docker build -t elastic ./

# docker run -d --name elasticsearch -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" elastic
docker run -d --name elasticsearch -p 9200:9200 elastic
docker ps -a
docker logs elasticsearch
docker exec -it elasticsearch bash
docker restart elasticsearch
docker stop elasticsearch
docker rm elasticsearch

docker tag elastic gcr.io/dac-angular-d2bbd/elastic

# 初回
gcloud auth configure-docker
docker push gcr.io/dac-angular-d2bbd/elastic

gcloud compute instances create-with-container elasticsearch --container-image=gcr.io/dac-angular-d2bbd/elastic --machine-type n1-standard-1 --zone us-central1-f --tags elastic-http-server --metadata=startup-script="echo 'vm.max_map_count=262144' > /etc/sysctl.conf; sysctl -p;"

# 初回
gcloud compute firewall-rules create allow-http --allow tcp:9200 --target-tags elastic-http-server
