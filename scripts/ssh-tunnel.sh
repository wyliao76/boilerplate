#!/bin/env bash
export AWS_PROFILE=vcosmos

SshCommand=$(node ./query-ssh-tunnel.js)
echo $SshCommand
$SshCommand

unset AWS_PROFILE
