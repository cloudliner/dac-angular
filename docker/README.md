# Dockerイメージをビルド
docker build -t elastic ./

# パスワード設定
firebase functions:config:set elasticsearch.password="testPassword"

firebase deploy --only functions

# 環境設定ファイル生成
echo "ES_JAVA_OPTS=-Xms512m -Xmx512m" > envfile && \
  echo -n "ELASTIC_PASSWORD=" >> envfile && \
  firebase functions:config:get elasticsearch.password | sed "s/\"//g" >> envfile && \
  echo "xpack.security.enabled=true" >> envfile && \
  echo "discovery.type=single-node" >> envfile

# ローカル実行
docker run -d --name elasticsearch --env-file=envfile -p 9200:9200 elastic
docker ps -a
docker logs elasticsearch
docker exec -it elasticsearch bash
docker restart elasticsearch
docker stop elasticsearch
docker rm elasticsearch

# ローカルタグ設定
docker tag elastic gcr.io/dac-angular-d2bbd/elastic

# 初回（GCPのDocker認証）
gcloud auth configure-docker

# GCPにDockerイメージをプッシュ
docker push gcr.io/dac-angular-d2bbd/elastic

# GCPでインタンス作成s
gcloud compute instances create-with-container elasticsearch --container-image=gcr.io/dac-angular-d2bbd/elastic --machine-type g1-small --zone us-central1-f --tags elastic-http-server --container-env-file=envfile --metadata=startup-script="echo 'vm.max_map_count=262144' > /etc/sysctl.conf; sysctl -p;"

# 初回（GCEのネットワーク設定）
gcloud compute firewall-rules create allow-http --allow tcp:9200 --target-tags elastic-http-server

# サーバーIPアドレス設定
firebase functions:config:set elasticsearch.host="127.0.0.1"

firebase deploy --only functions
