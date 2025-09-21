#!/bin/bash

echo "Démarrage de Minikube..."
minikube start --driver=docker

echo "Construction de l'image Docker..."
eval $(minikube docker-env)
docker build -t devops-app:latest ./app

echo "Déploiement sur Kubernetes..."
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/prometheus/rbac.yaml
kubectl apply -f k8s/prometheus/configmap.yaml
kubectl apply -f k8s/prometheus/deployment.yaml
kubectl apply -f k8s/prometheus/service.yaml
kubectl apply -f k8s/grafana/pvc.yaml
kubectl apply -f k8s/grafana/deployment.yaml
kubectl apply -f k8s/grafana/service.yaml
kubectl apply -f k8s/app/deployment.yaml
kubectl apply -f k8s/app/service.yaml

echo "Attente que tous les pods soient prêts..."
kubectl wait --for=condition=ready pod -l app=prometheus -n monitoring --timeout=300s
kubectl wait --for=condition=ready pod -l app=grafana -n monitoring --timeout=300s
kubectl wait --for=condition=ready pod -l app=devops-app -n monitoring --timeout=300s

echo "Services accessibles via :"
echo "Application: http://$(minikube ip):30000"
echo "Prometheus: http://$(minikube ip):30090"
echo "Grafana: http://$(minikube ip):30030"
echo ""
echo "Status des services :"
kubectl get pods -n monitoring