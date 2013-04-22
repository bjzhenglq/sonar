/*
 * SonarQube, open source software quality management tool.
 * Copyright (C) 2008-2012 SonarSource
 * mailto:contact AT sonarsource DOT com
 *
 * SonarQube is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * SonarQube is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with Sonar; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02
 */
package org.sonar.wsclient.issue;

import org.sonar.wsclient.internal.EncodingUtils;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * @since 3.6
 */
public class IssueQuery {

  static final String BASE_URL = "/api/issues/search";
  private final Map<String, Object> params = new HashMap<String, Object>();

  private IssueQuery() {
  }

  public static IssueQuery create() {
    return new IssueQuery();
  }

  Map<String, Object> urlParams() {
    return params;
  }

  public IssueQuery keys(String... keys) {
    return addParam("keys", keys);
  }

  public IssueQuery severities(String... severities) {
    return addParam("severities", severities);
  }

  public IssueQuery statuses(String... statuses) {
    return addParam("statuses", statuses);
  }

  public IssueQuery resolutions(String... resolutions) {
    return addParam("resolutions", resolutions);
  }

  public IssueQuery components(String... components) {
    return addParam("components", components);
  }

  public IssueQuery componentRoots(String... componentRoots) {
    return addParam("componentRoots", componentRoots);
  }

  public IssueQuery rules(String... s) {
    return addParam("rules", s);
  }

  public IssueQuery userLogins(String... s) {
    return addParam("userLogins", s);
  }

  public IssueQuery assignees(String... s) {
    return addParam("assignees", s);
  }

  public IssueQuery createdAfter(Date d) {
    params.put("createdAfter", EncodingUtils.toQueryParam(d, true));
    return this;
  }

  public IssueQuery createdBefore(Date d) {
    params.put("createdBefore", EncodingUtils.toQueryParam(d, true));
    return this;
  }

  public IssueQuery limit(int limit) {
    params.put("limit", limit);
    return this;
  }

  public IssueQuery offset(int offset) {
    params.put("offset", offset);
    return this;
  }

  private IssueQuery addParam(String key, String[] values) {
    if (values != null) {
      params.put(key, EncodingUtils.toQueryParam(values));
    }
    return this;
  }

}