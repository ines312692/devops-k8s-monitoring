#!/bin/bash

echo " Nettoyage des ressources..."
kubectl delete namespace monitoring
minikube stop
echo "✅ Nettoyage terminé"