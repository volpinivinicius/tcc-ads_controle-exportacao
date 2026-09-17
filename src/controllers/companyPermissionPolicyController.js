/**
 * CRUD for CompanyPermissionPolicy, keyed by companyId (one
 * policy per company). See README > Permission Delegation.
 * Authorization (SYSTEM-only) is enforced inside the service.
 */

const companyPermissionPolicyService = require("../services/companyPermissionPolicyService");

async function create(req, res, next) {
  try {
    const policy = await companyPermissionPolicyService.createPolicy(req.body, req.user);
    res.status(201).json(policy);
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    const policies = await companyPermissionPolicyService.listPolicies(req.user);
    res.json(policies);
  } catch (error) {
    next(error);
  }
}

async function getByCompany(req, res, next) {
  try {
    const policy = await companyPermissionPolicyService.getPolicyByCompanyId(
      req.params.companyId,
      req.user
    );
    res.json(policy);
  } catch (error) {
    next(error);
  }
}

async function updateByCompany(req, res, next) {
  try {
    const policy = await companyPermissionPolicyService.updatePolicyByCompanyId(
      req.params.companyId,
      req.body,
      req.user
    );
    res.json(policy);
  } catch (error) {
    next(error);
  }
}

async function removeByCompany(req, res, next) {
  try {
    await companyPermissionPolicyService.deletePolicyByCompanyId(
      req.params.companyId,
      req.user
    );
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { create, list, getByCompany, updateByCompany, removeByCompany };