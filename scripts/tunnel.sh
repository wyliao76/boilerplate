lsof -ti:5558| xargs kill

ssh -fNg -L 5558:remote_host:27017 ec2-user@$(aws --region ap-southeast-1 autoscaling describe-auto-scaling-groups --auto-scaling-group-names $(aws ssm get-parameter --region=ap-southeast-1 --name name --query Parameter.Value --output text) --query "AutoScalingGroups[0].Instances[0].InstanceId" --output text)--ap-southeast-1
